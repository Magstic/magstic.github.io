'use strict';

(function() {
  const CALENDAR_CLOSE_DELAY = 200;

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
