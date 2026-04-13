package handler

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/mail/internal/dkim"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

func (h *Handler) ListDomains(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domains, err := h.Store.GetDomainsByUser(r.Context(), userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to list domains")
		return
	}
	if domains == nil {
		domains = []model.CustomDomain{}
	}
	h.JSON(w, http.StatusOK, domains)
}

func (h *Handler) AddDomain(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	var req model.AddDomainRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	domainName := strings.ToLower(strings.TrimSpace(req.Domain))
	if domainName == "" {
		h.Error(w, http.StatusBadRequest, "domain is required")
		return
	}

	// Basic domain normalization + validation.
	// Reject schemes/paths and only allow a plain hostname like "example.com".
	if strings.Contains(domainName, "://") {
		h.Error(w, http.StatusBadRequest, "domain must be a hostname (no scheme)")
		return
	}
	if strings.ContainsAny(domainName, " /\\\t\r\n") {
		h.Error(w, http.StatusBadRequest, "invalid domain format")
		return
	}
	if u, err := url.Parse("https://" + domainName); err != nil || u.Hostname() != domainName || strings.Contains(u.Hostname(), "..") {
		h.Error(w, http.StatusBadRequest, "invalid domain format")
		return
	}
	// Ensure the hostname is valid per net rules.
	if strings.TrimSuffix(domainName, ".") != domainName {
		h.Error(w, http.StatusBadRequest, "domain must not be a FQDN with trailing dot")
		return
	}
	if _, err := net.LookupHost(domainName); err != nil {
		// Don't hard-fail if DNS is temporarily unavailable; just validate syntax.
		// But if the error is a parse error, reject.
		if dnsErr, ok := err.(*net.DNSError); ok && dnsErr.IsNotFound {
			// ok (domain may not exist yet or may not resolve)
		} else if strings.Contains(strings.ToLower(err.Error()), "invalid") {
			h.Error(w, http.StatusBadRequest, "invalid domain format")
			return
		}
	}

	tokenBytes := make([]byte, 16)
	if _, err := rand.Read(tokenBytes); err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to generate verification token")
		return
	}
	token := "haseen-verify-" + hex.EncodeToString(tokenBytes)

	domain, err := h.Store.CreateDomain(r.Context(), userID, domainName, token)
	if err != nil {
		errLower := strings.ToLower(err.Error())
		if strings.Contains(errLower, "duplicate") || strings.Contains(errLower, "unique") {
			h.Error(w, http.StatusConflict, "domain already registered")
			return
		}
		if strings.Contains(errLower, "violates foreign key constraint") {
			h.Error(w, http.StatusBadRequest, "invalid user")
			return
		}
		h.Log.Error().Err(err).Str("domain", domainName).Msg("create domain failed")
		h.Error(w, http.StatusInternalServerError, "failed to add domain (db)")
		return
	}

	kp, err := dkim.GenerateKeyPair("haseen", 2048)
	if err != nil {
		h.Log.Error().Err(err).Str("domain", domainName).Msg("DKIM key generation failed")
		h.Store.DeleteDomain(r.Context(), domain.ID, userID)
		h.Error(w, http.StatusInternalServerError, "failed to generate DKIM keys")
		return
	}

	dkimKey, err := h.Store.CreateDKIMKey(r.Context(), domain.ID, kp.Selector, kp.EncryptedKey, kp.IV, kp.PublicKeyDNS, 2048)
	if err != nil {
		h.Log.Error().Err(err).Msg("store DKIM key failed")
		h.Store.DeleteDomain(r.Context(), domain.ID, userID)
		h.Error(w, http.StatusInternalServerError, "failed to store DKIM keys (db)")
		return
	}

	resp := model.DomainResponse{
		Domain:     *domain,
		DNSRecords: buildDNSRecords(domainName, h.Domain, dkimKey, token),
		Mailboxes:  []model.DomainMailbox{},
	}

	h.JSON(w, http.StatusCreated, resp)
}

func (h *Handler) GetDomain(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")

	domain, err := h.Store.GetDomain(r.Context(), domainID, userID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	dkimKeys, _ := h.Store.GetDKIMKeysByDomain(r.Context(), domainID)
	var activeDKIM *model.DKIMKey
	for i, k := range dkimKeys {
		if k.Active {
			activeDKIM = &dkimKeys[i]
			break
		}
	}

	mailboxes, _ := h.Store.GetDomainMailboxes(r.Context(), domainID)
	if mailboxes == nil {
		mailboxes = []model.DomainMailbox{}
	}

	resp := model.DomainResponse{
		Domain:     *domain,
		DNSRecords: buildDNSRecords(domain.Domain, h.Domain, activeDKIM, domain.VerificationToken),
		Mailboxes:  mailboxes,
	}

	h.JSON(w, http.StatusOK, resp)
}

func (h *Handler) DeleteDomain(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")

	if err := h.Store.DeleteDomain(r.Context(), domainID, userID); err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	h.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) VerifyDomain(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")

	if h.DNSWorker != nil {
		if err := h.DNSWorker.CheckDomainDirect(r.Context(), domainID, userID); err != nil {
			h.Error(w, http.StatusNotFound, "domain not found")
			return
		}
	}

	domain, err := h.Store.GetDomain(r.Context(), domainID, userID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	h.JSON(w, http.StatusOK, domain)
}

func (h *Handler) GetDNSRecords(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")

	domain, err := h.Store.GetDomain(r.Context(), domainID, userID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	dkimKey, _ := h.Store.GetActiveDKIMKey(r.Context(), domainID)
	records := buildDNSRecords(domain.Domain, h.Domain, dkimKey, domain.VerificationToken)

	h.JSON(w, http.StatusOK, records)
}

func (h *Handler) GetDNSCheckLogs(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")

	if _, err := h.Store.GetDomain(r.Context(), domainID, userID); err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	logs, err := h.Store.GetDNSCheckLogs(r.Context(), domainID, 50)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to get DNS check logs")
		return
	}
	if logs == nil {
		logs = []model.DNSCheckLog{}
	}

	h.JSON(w, http.StatusOK, logs)
}

// --- Mailbox Management ---

func (h *Handler) AddDomainMailbox(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")

	if _, err := h.Store.GetDomain(r.Context(), domainID, userID); err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	var req model.AddMailboxRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	localPart := strings.ToLower(strings.TrimSpace(req.LocalPart))
	if localPart == "" {
		h.Error(w, http.StatusBadRequest, "localPart is required")
		return
	}

	mb, err := h.Store.CreateDomainMailbox(r.Context(), domainID, userID, localPart, req.DisplayName, req.IsCatchAll)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			h.Error(w, http.StatusConflict, "mailbox already exists for this address")
			return
		}
		h.Error(w, http.StatusInternalServerError, "failed to create mailbox")
		return
	}

	h.JSON(w, http.StatusCreated, mb)
}

func (h *Handler) ListDomainMailboxes(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")

	if _, err := h.Store.GetDomain(r.Context(), domainID, userID); err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	mailboxes, err := h.Store.GetDomainMailboxes(r.Context(), domainID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to list mailboxes")
		return
	}
	if mailboxes == nil {
		mailboxes = []model.DomainMailbox{}
	}

	h.JSON(w, http.StatusOK, mailboxes)
}

func (h *Handler) DeleteDomainMailbox(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	domainID := chi.URLParam(r, "domainID")
	mailboxID := chi.URLParam(r, "mailboxID")

	if _, err := h.Store.GetDomain(r.Context(), domainID, userID); err != nil {
		h.Error(w, http.StatusNotFound, "domain not found")
		return
	}

	if err := h.Store.DeleteDomainMailbox(r.Context(), mailboxID, domainID); err != nil {
		h.Error(w, http.StatusNotFound, "mailbox not found")
		return
	}

	h.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func buildDNSRecords(domainName, mailDomain string, dkimKey *model.DKIMKey, token string) model.DomainDNSRecords {
	dkimValue := ""
	dkimHost := "haseen._domainkey." + domainName
	if dkimKey != nil {
		dkimValue = fmt.Sprintf("v=DKIM1; k=rsa; p=%s", dkimKey.PublicKey)
		dkimHost = dkimKey.Selector + "._domainkey." + domainName
	}

	return model.DomainDNSRecords{
		MX: model.DNSRecord{
			Type:  "MX",
			Host:  domainName,
			Value: fmt.Sprintf("10 mail.%s", mailDomain),
		},
		SPF: model.DNSRecord{
			Type:  "TXT",
			Host:  domainName,
			Value: fmt.Sprintf("v=spf1 include:%s ~all", mailDomain),
		},
		DKIM: model.DNSRecord{
			Type:  "TXT",
			Host:  dkimHost,
			Value: dkimValue,
		},
		DMARC: model.DNSRecord{
			Type:  "TXT",
			Host:  "_dmarc." + domainName,
			Value: fmt.Sprintf("v=DMARC1; p=quarantine; rua=mailto:dmarc@%s", mailDomain),
		},
	}
}
