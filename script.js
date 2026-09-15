document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      siteNav.classList.toggle('is-open', !isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
    });

    // Close the mobile menu after a nav link is tapped
    siteNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'メニューを開く');
        siteNav.classList.remove('is-open');
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.accordion-item');
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      trigger.setAttribute('aria-expanded', String(!isOpen));
      item.classList.toggle('is-open', !isOpen);
    });
  });

  /* ---------- Footer copyright year ---------- */
  var yearEl = document.getElementById('copyrightYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Auto-archive past schedule dates ---------- */
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var scheduleDateEls = document.querySelectorAll('.schedule-dates li[data-date]');
  var archiveList = document.getElementById('archiveList');
  var archiveEmptyNote = document.getElementById('archiveEmptyNote');
  var autoEntries = [];

  scheduleDateEls.forEach(function (li) {
    var dateStr = li.getAttribute('data-date');
    var itemDate = new Date(dateStr + 'T00:00:00');

    if (itemDate.getTime() < today.getTime()) {
      li.classList.add('is-past');

      var label = li.getAttribute('data-label') || dateStr;
      autoEntries.push({
        date: dateStr,
        text: label + ' 常駐サポート実施'
      });
    }
  });

  if (archiveList && autoEntries.length) {
    autoEntries.forEach(function (entry) {
      // Avoid duplicating an entry that was already added on a previous run
      if (archiveList.querySelector('[data-date="' + entry.date + '"][data-auto="true"]')) {
        return;
      }

      var d = new Date(entry.date + 'T00:00:00');
      var card = document.createElement('li');
      card.className = 'archive-card archive-card--auto';
      card.setAttribute('data-date', entry.date);
      card.setAttribute('data-auto', 'true');

      var time = document.createElement('time');
      time.className = 'archive-date';
      time.setAttribute('datetime', entry.date);
      time.textContent = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();

      var text = document.createElement('p');
      text.className = 'archive-text';
      text.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + entry.text;

      card.appendChild(time);
      card.appendChild(text);
      archiveList.appendChild(card);
    });
  }

  if (archiveList) {
    // Keep the archive newest-first regardless of source (sample data or auto-added)
    var cards = Array.prototype.slice.call(archiveList.querySelectorAll('.archive-card'));
    cards.sort(function (a, b) {
      return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
    });
    cards.forEach(function (card) {
      archiveList.appendChild(card);
    });

    if (archiveEmptyNote) {
      archiveEmptyNote.hidden = cards.length > 0;
    }
  }

  /* ---------- Next upcoming session banner ---------- */
  var nextBanner = document.getElementById('nextSessionBanner');
  var nextValueEl = document.getElementById('nextSessionValue');

  if (nextBanner && nextValueEl) {
    var weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];

    var upcoming = Array.prototype.slice.call(scheduleDateEls)
      .filter(function (li) {
        var itemDate = new Date(li.getAttribute('data-date') + 'T00:00:00');
        return itemDate.getTime() >= today.getTime();
      })
      .sort(function (a, b) {
        return new Date(a.getAttribute('data-date')) - new Date(b.getAttribute('data-date'));
      });

    if (upcoming.length) {
      var next = upcoming[0];
      var d = new Date(next.getAttribute('data-date') + 'T00:00:00');
      var weekday = weekdayNames[d.getDay()];
      var time = next.getAttribute('data-time');

      nextValueEl.textContent = (d.getMonth() + 1) + '/' + d.getDate() + '（' + weekday + '）' + (time ? time + '〜' : '');
      nextBanner.hidden = false;
    }
  }
});
