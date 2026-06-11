'use strict';

(function() {
  const CALENDAR_CLOSE_DELAY = 200;
  const DEFAULT_TODAY_LABEL = '今日';
  const DEFAULT_YESTERDAY_LABEL = '昨日';

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function parseMomentDateTime(value) {
    const matched = String(value || '').trim().match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/
    );

    if (!matched) {
      return null;
    }

    return {
      year: Number(matched[1]),
      month: Number(matched[2]),
      day: Number(matched[3]),
      hour: Number(matched[4]),
      minute: Number(matched[5]),
      second: Number(matched[6] || 0)
    };
  }

  function getCurrentDateParts(timeZone) {
    try {
      if (timeZone) {
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const parts = formatter.formatToParts(new Date());
        const values = {};

        parts.forEach(function(part) {
          if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
            values[part.type] = Number(part.value);
          }
        });

        if (values.year && values.month && values.day) {
          return values;
        }
      }
    } catch (error) {
      void error;
    }

    const now = new Date();

    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }

  function formatAbsoluteMoment(parts) {
    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}`;
  }

  function formatMonthDayMoment(parts) {
    return `${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}`;
  }

  function formatRelativeMoment(parts, currentParts, mode, labels) {
    const dayDiff = Math.round(
      (Date.UTC(currentParts.year, currentParts.month - 1, currentParts.day) -
        Date.UTC(parts.year, parts.month - 1, parts.day)) / 86400000
    );
    const timeLabel = `${pad(parts.hour)}:${pad(parts.minute)}`;

    if (dayDiff === 0) {
      return `${labels.today} ${timeLabel}`;
    }

    if (dayDiff === 1) {
      return `${labels.yesterday} ${timeLabel}`;
    }

    if (mode === 'home' && parts.year !== currentParts.year) {
      return formatAbsoluteMoment(parts);
    }

    return formatMonthDayMoment(parts);
  }

  function refreshRelativeTime(element) {
    if (!element) {
      return;
    }

    const mode = element.dataset.momentMode;
    const dateParts = parseMomentDateTime(element.getAttribute('datetime'));

    if (!mode || !dateParts) {
      return;
    }

    const currentParts = getCurrentDateParts(element.dataset.momentTimezone || '');
    const labels = {
      today: element.dataset.momentToday || DEFAULT_TODAY_LABEL,
      yesterday: element.dataset.momentYesterday || DEFAULT_YESTERDAY_LABEL
    };

    element.textContent = formatRelativeMoment(dateParts, currentParts, mode, labels);
  }

  function activateYear(panel, targetYear) {
    if (!panel || !targetYear) {
      return;
    }

    panel.querySelectorAll('.moments-calendar__year-view').forEach(function(view) {
      const isActive = view.getAttribute('data-calendar-year') === targetYear;
      view.classList.toggle('is-active', isActive);

      if (isActive) {
        view.removeAttribute('aria-hidden');
      } else {
        view.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function clearCloseTimer(calendar) {
    if (!calendar || !calendar.dataset.closeTimer) {
      return;
    }

    window.clearTimeout(Number(calendar.dataset.closeTimer));
    delete calendar.dataset.closeTimer;
  }

  function finishClose(calendar) {
    if (!calendar) {
      return;
    }

    clearCloseTimer(calendar);
    calendar.classList.remove('is-closing');
    calendar.removeAttribute('open');
  }

  function closeCalendar(calendar) {
    if (!calendar || !calendar.hasAttribute('open')) {
      return;
    }

    clearCloseTimer(calendar);
    calendar.classList.remove('is-active');
    calendar.classList.add('is-closing');
    calendar.dataset.closeTimer = String(window.setTimeout(function() {
      finishClose(calendar);
    }, CALENDAR_CLOSE_DELAY));
  }

  function closeAllCalendars(exceptCalendar) {
    document.querySelectorAll('.moments-calendar[open], .moments-calendar.is-closing').forEach(function(calendar) {
      if (calendar !== exceptCalendar) {
        closeCalendar(calendar);
      }
    });
  }

  function openCalendar(calendar) {
    if (!calendar) {
      return;
    }

    closeAllCalendars(calendar);
    clearCloseTimer(calendar);
    calendar.classList.remove('is-closing');

    if (!calendar.hasAttribute('open')) {
      calendar.setAttribute('open', '');
    }

    window.requestAnimationFrame(function() {
      calendar.classList.add('is-active');
    });
  }

  function bindCalendar(calendar) {
    if (!calendar || calendar.dataset.calendarBound === 'true') {
      return;
    }

    const toggle = calendar.querySelector('.moments-calendar__toggle');
    const panel = calendar.querySelector('.moments-calendar__panel');

    if (!toggle || !panel) {
      return;
    }

    calendar.dataset.calendarBound = 'true';

    toggle.addEventListener('click', function(event) {
      event.preventDefault();

      if (calendar.classList.contains('is-active')) {
        closeCalendar(calendar);
        return;
      }

      openCalendar(calendar);
    });

    calendar.addEventListener('toggle', function() {
      if (!calendar.open) {
        clearCloseTimer(calendar);
        calendar.classList.remove('is-active', 'is-closing');
      }
    });

    panel.addEventListener('click', function(event) {
      const trigger = event.target.closest('.moments-calendar__year-nav[data-target-year]');

      if (!trigger || trigger.disabled) {
        return;
      }

      activateYear(panel, trigger.getAttribute('data-target-year'));
    });
  }

  function init(root) {
    const scope = root && root.querySelectorAll ? root : document;

    scope.querySelectorAll('[data-moment-mode]').forEach(function(timeElement) {
      refreshRelativeTime(timeElement);
    });

    scope.querySelectorAll('.moments-calendar').forEach(function(calendar) {
      bindCalendar(calendar);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      init(document);
    });
  } else {
    init(document);
  }

  if (!window.__hexoMomentsCalendarGlobalBound) {
    window.__hexoMomentsCalendarGlobalBound = true;

    document.addEventListener('pjax:complete', function() {
      init(document);
    });

    document.addEventListener('click', function(event) {
      if (event.target.closest('.moments-calendar')) {
        return;
      }

      closeAllCalendars();
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeAllCalendars();
      }
    });
  }
})();
