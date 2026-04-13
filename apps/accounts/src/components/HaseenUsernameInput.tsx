import { useEffect, useId, useMemo, useState, type ChangeEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

type AvailabilityResult = {
  available: boolean;
  message?: string;
};

type UsernameChangePayload = {
  username: string;
  email: string;
  isValid: boolean;
  isAvailable: boolean;
  status: AvailabilityState;
};

type HaseenUsernameInputProps = {
  initialUsername?: string;
  fixedDomain?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  label?: string;
  checkAvailability?: (username: string) => Promise<AvailabilityResult>;
  onValueChange?: (payload: UsernameChangePayload) => void;
};

const DEFAULT_DOMAIN = 'haseen.me';
const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_MAX_LENGTH = 24;
const USERNAME_REGEX = /^(?![._])(?!.*[._]{2})[a-z0-9._]+(?<![._])$/;

const TAKEN_USERNAMES = new Set([
  'admin',
  'support',
  'security',
  'hello',
  'privacy',
  'contact',
  'nazim',
]);

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function mockCheckUsernameAvailability(username: string): Promise<AvailabilityResult> {
  await sleep(700);

  if (TAKEN_USERNAMES.has(username.toLowerCase())) {
    return {
      available: false,
      message: 'This username is already taken',
    };
  }

  return {
    available: true,
    message: 'Username is available',
  };
}

function normalizeUsername(value: string) {
  return value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9._]/g, '');
}

function validateUsername(username: string, minLength: number, maxLength: number) {
  if (!username) {
    return 'Choose your email username';
  }

  if (username.length < minLength) {
    return `Use at least ${minLength} characters`;
  }

  if (username.length > maxLength) {
    return `Use ${maxLength} characters or fewer`;
  }

  if (!USERNAME_REGEX.test(username)) {
    return 'Use only letters, numbers, periods, or underscores';
  }

  return '';
}

export function HaseenUsernameInput({
  initialUsername = '',
  fixedDomain = DEFAULT_DOMAIN,
  minLength = DEFAULT_MIN_LENGTH,
  maxLength = DEFAULT_MAX_LENGTH,
  disabled = false,
  label = 'Choose your Haseen Mail address',
  checkAvailability = mockCheckUsernameAvailability,
  onValueChange,
}: HaseenUsernameInputProps) {
  const [username, setUsername] = useState(() => normalizeUsername(initialUsername));
  const [availability, setAvailability] = useState<AvailabilityState>('idle');
  const [helperText, setHelperText] = useState('Only letters, numbers, periods, and underscores.');
  const [hasTyped, setHasTyped] = useState(false);
  const inputId = useId();
  const helperId = `${inputId}-helper`;

  const validationMessage = useMemo(
    () => validateUsername(username, minLength, maxLength),
    [username, minLength, maxLength]
  );

  const emailAddress = useMemo(
    () => (username ? `${username}@${fixedDomain}` : `@${fixedDomain}`),
    [fixedDomain, username]
  );

  useEffect(() => {
    onValueChange?.({
      username,
      email: emailAddress,
      isValid: !validationMessage,
      isAvailable: availability === 'available',
      status: availability,
    });
  }, [availability, emailAddress, onValueChange, username, validationMessage]);

  useEffect(() => {
    if (!hasTyped && !username) {
      setAvailability('idle');
      setHelperText('Only letters, numbers, periods, and underscores.');
      return;
    }

    if (validationMessage) {
      setAvailability('invalid');
      setHelperText(validationMessage);
      return;
    }

    setAvailability('checking');
    setHelperText('Checking availability...');

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await checkAvailability(username);

        if (cancelled) {
          return;
        }

        if (result.available) {
          setAvailability('available');
          setHelperText(result.message ?? 'Username is available');
          return;
        }

        setAvailability('taken');
        setHelperText(result.message ?? 'This username is already taken');
      } catch {
        if (!cancelled) {
          setAvailability('taken');
          setHelperText('Could not verify username availability');
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [checkAvailability, hasTyped, username, validationMessage]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHasTyped(true);
    setUsername(normalizeUsername(event.target.value));
  };

  const hasError = availability === 'invalid' || availability === 'taken';

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
        {label}
      </label>

      <div
        className={[
          'group flex min-h-14 w-full items-center gap-3 rounded-xl border bg-white px-4 transition-all duration-200',
          'dark:bg-zinc-950',
          disabled ? 'cursor-not-allowed opacity-70' : '',
          hasError
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10'
            : 'border-zinc-300 hover:border-zinc-400 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/15 dark:border-zinc-700 dark:hover:border-zinc-600 dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400/15',
        ].join(' ')}
      >
        <Mail className="h-4 w-4 shrink-0 text-zinc-400 transition-colors group-focus-within:text-teal-500" />

        <input
          id={inputId}
          value={username}
          onChange={handleChange}
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="email"
          placeholder="yourname"
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={helperId}
          className="min-w-0 flex-1 border-0 bg-transparent py-3 text-base text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
        />

        <div className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-sm font-medium text-zinc-500 dark:text-zinc-400">
            @{fixedDomain}
          </span>

          {availability === 'checking' && (
            <Loader2 className="h-4 w-4 animate-spin text-teal-500" aria-hidden="true" />
          )}

          {availability === 'available' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          )}

          {hasError && <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />}
        </div>
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <p
          id={helperId}
          className={[
            'text-sm',
            availability === 'available'
              ? 'text-emerald-600 dark:text-emerald-400'
              : hasError
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-500 dark:text-zinc-400',
          ].join(' ')}
        >
          {helperText}
        </p>

        <p className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">{emailAddress}</p>
      </div>
    </div>
  );
}
