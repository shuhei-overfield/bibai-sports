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

  /* ---------- Auto-archive past schedule dates ----------
     関数化してあるのは、下の「月次スケジュール自動切り替え」の前後
     （切り替え前の旧月分・切り替え後の新月分）両方で呼び出すため。 */
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var archiveList = document.getElementById('archiveList');
  var archiveEmptyNote = document.getElementById('archiveEmptyNote');

  function archivePastScheduleDates() {
    var scheduleDateEls = document.querySelectorAll('.schedule-dates li[data-date]');
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
  }

  // 1回目: 現在HTML上にある月（9月）の日程を対象に実行
  archivePastScheduleDates();

  /* ---------- Scheduled monthly switch (9月 -> 10月 VOL.2) ----------
     2026-10-02 以降にこのページを開くと、9月の常駐スケジュールを自動的に
     10月「VOL.2」の日程に差し替えます（閲覧者それぞれの端末の日時で判定
     するため、手動更新は不要です）。9月分は上の1回目のアーカイブ処理で
     過去の実施実績として記録済みです。
     翌月以降も同じ仕組みを使う場合は、SWITCH_DATE と NEXT_SCHEDULE の
     中身を書き換えてください。 */
  var SWITCH_DATE = new Date('2026-10-02T00:00:00');
  var NEXT_SCHEDULE = {
    am: [
      { date: '2026-10-05', time: '9:30', text: '10/5', weekday: '（月）' },
      { date: '2026-10-13', time: '9:30', text: '10/13', weekday: '（火）' },
      { date: '2026-10-26', time: '9:30', text: '10/26', weekday: '（月）' }
    ],
    pm: [
      { date: '2026-10-08', time: '15:30', text: '10/8', weekday: '（木）' },
      { date: '2026-10-15', time: '15:30', text: '10/15', weekday: '（木）' }
    ]
  };

  if (today.getTime() >= SWITCH_DATE.getTime()) {
    var renderScheduleList = function (ul, items, suffix) {
      if (!ul) return;
      ul.innerHTML = '';
      items.forEach(function (item) {
        var li = document.createElement('li');
        li.setAttribute('data-date', item.date);
        li.setAttribute('data-time', item.time);
        li.setAttribute('data-label', item.text + item.weekday + suffix);
        li.appendChild(document.createTextNode(item.text));

        var span = document.createElement('span');
        span.textContent = item.weekday;
        li.appendChild(span);

        ul.appendChild(li);
      });
    };

    renderScheduleList(document.getElementById('scheduleDatesAM'), NEXT_SCHEDULE.am, '午前');
    renderScheduleList(document.getElementById('scheduleDatesPM'), NEXT_SCHEDULE.pm, '午後');

    // 2回目: 差し替え後（10月分）に、既に過ぎた日程がないか再チェック
    // （例: 10月中旬に初めて訪れた場合、10/5などを自動でアーカイブする）
    archivePastScheduleDates();
  }

  var scheduleDateEls = document.querySelectorAll('.schedule-dates li[data-date]');

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
