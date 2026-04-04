package store

import (
"strconv"
"strings"
"time"

"github.com/haseen-me/haseen-apps/services/calendar/internal/model"
)

// expandRecurring takes a recurring event template and generates virtual instances
// within the query window [windowStart, windowEnd).
// Supports simple RRULE: FREQ=DAILY|WEEKLY|MONTHLY|YEARLY;COUNT=n;UNTIL=yyyymmddThhmmssZ;INTERVAL=n
func expandRecurring(template model.Event, windowStart, windowEnd time.Time) []model.Event {
if template.RecurrenceRule == nil || *template.RecurrenceRule == "" {
return nil
}

rule := parseRRule(*template.RecurrenceRule)
if rule.freq == "" {
return nil
}

duration := template.EndTime.Sub(template.StartTime)
maxInstances := 365 // safety cap
if rule.count > 0 && rule.count < maxInstances {
maxInstances = rule.count
}

interval := rule.interval
if interval < 1 {
interval = 1
}

var instances []model.Event
cursor := template.StartTime

for i := 0; i < maxInstances; i++ {
instanceEnd := cursor.Add(duration)

// Stop if past window or UNTIL
if cursor.After(windowEnd) || cursor.Equal(windowEnd) {
break
}
if !rule.until.IsZero() && cursor.After(rule.until) {
break
}

// Include if overlaps with window
if instanceEnd.After(windowStart) {
inst := template
inst.StartTime = cursor
inst.EndTime = instanceEnd
// Mark virtual instances with composite ID so frontend can distinguish
if i > 0 {
inst.ID = template.ID + "_" + cursor.Format("20060102T150405")
}
instances = append(instances, inst)
}

// Advance cursor
switch rule.freq {
case "DAILY":
cursor = cursor.AddDate(0, 0, interval)
case "WEEKLY":
cursor = cursor.AddDate(0, 0, 7*interval)
case "MONTHLY":
cursor = cursor.AddDate(0, interval, 0)
case "YEARLY":
cursor = cursor.AddDate(interval, 0, 0)
default:
break
}
}
return instances
}

type rrule struct {
freq     string
count    int
until    time.Time
interval int
}

func parseRRule(raw string) rrule {
r := rrule{interval: 1}
// Strip "RRULE:" prefix if present
raw = strings.TrimPrefix(raw, "RRULE:")

for _, part := range strings.Split(raw, ";") {
kv := strings.SplitN(part, "=", 2)
if len(kv) != 2 {
continue
}
key := strings.ToUpper(strings.TrimSpace(kv[0]))
val := strings.TrimSpace(kv[1])
switch key {
case "FREQ":
r.freq = strings.ToUpper(val)
case "COUNT":
n, _ := strconv.Atoi(val)
r.count = n
case "UNTIL":
// Try ISO 8601 basic format: 20260415T120000Z
t, err := time.Parse("20060102T150405Z", val)
if err != nil {
t, _ = time.Parse(time.RFC3339, val)
}
r.until = t
case "INTERVAL":
n, _ := strconv.Atoi(val)
if n > 0 {
r.interval = n
}
}
}
return r
}
