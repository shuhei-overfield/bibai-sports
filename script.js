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

  /* ---------- Scheduled monthly switch: メインエリア（#training 常駐スケジュール）----------
     「9月 -> 10月」「10月 -> 11月」のように、月が替わるたびに差し替え
     ブロックを1つずつ追加していく方式。各ブロックは SWITCH_DATE 以降
     であれば常駐スケジュールを該当月の日程に上書きするので、過去のブ
     ロックから順に実行することで「訪問した月の最新スケジュール」が
     正しく表示される（例: 11月に訪問した場合、10月ブロックが先に10月
     分を書き込み、続けて11月ブロックがそれを11月分で上書きする）。
     翌月以降も同じ仕組みを使う場合は、このパターンのまま新しいブロッ
     クを下に追加してください（既存ブロックは消さずに残す）。 */
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

  var scheduleDatesAMEl = document.getElementById('scheduleDatesAM');
  var scheduleDatesPMEl = document.getElementById('scheduleDatesPM');

  // --- 9月 -> 10月（期間: 2026-10-02 0:00〜） ---
  var SWITCH_DATE_OCT = new Date('2026-10-02T00:00:00');
  var OCT_SCHEDULE = {
    am: [
      { date: '2026-10-05', time: '9:30', text: '10/5', weekday: '（月）' },
      { date: '2026-10-26', time: '9:30', text: '10/26', weekday: '（月）' }
    ],
    pm: [
      { date: '2026-10-08', time: '15:30', text: '10/8', weekday: '（木）' },
      { date: '2026-10-15', time: '15:30', text: '10/15', weekday: '（木）' }
    ]
  };

  if (today.getTime() >= SWITCH_DATE_OCT.getTime()) {
    renderScheduleList(scheduleDatesAMEl, OCT_SCHEDULE.am, '午前');
    renderScheduleList(scheduleDatesPMEl, OCT_SCHEDULE.pm, '午後');

    // 差し替え後（10月分）に、既に過ぎた日程がないか再チェック
    // （例: 10月中旬に初めて訪れた場合、10/5などを自動でアーカイブする）
    archivePastScheduleDates();
  }

  // --- 10月 -> 11月（期間: 2026-11-01 0:00〜） ---
  var SWITCH_DATE_NOV = new Date('2026-11-01T00:00:00');
  var NOV_SCHEDULE = {
    am: [
      { date: '2026-11-02', time: '9:30', text: '11/2', weekday: '（月）' },
      { date: '2026-11-09', time: '9:30', text: '11/9', weekday: '（月）' },
      { date: '2026-11-16', time: '9:30', text: '11/16', weekday: '（月）' },
      { date: '2026-11-30', time: '9:30', text: '11/30', weekday: '（月）' }
    ],
    pm: [
      { date: '2026-11-26', time: '15:30', text: '11/26', weekday: '（木）' }
    ]
  };

  if (today.getTime() >= SWITCH_DATE_NOV.getTime()) {
    renderScheduleList(scheduleDatesAMEl, NOV_SCHEDULE.am, '午前');
    renderScheduleList(scheduleDatesPMEl, NOV_SCHEDULE.pm, '午後');

    // 差し替え後（11月分）に、既に過ぎた日程がないか再チェック
    archivePastScheduleDates();
  }

  /* ---------- VOL card scheduled switch: 開催スケジュールエリア（#upcoming のVOLカード、VOL.2 10月 -> VOL.3 11月） ----------
     2026-11-01 以降にこのページを開くと、「トレーニング室のご案内」の
     開催スケジュールカード（#upcoming 内）を VOL.2（10月分）から
     VOL.3（11月分・フライヤーPDFダウンロードボタン付き）に自動的に
     差し替えます（閲覧者それぞれの端末の日時で判定するため、手動更新
     は不要です）。
     翌月以降も同じ仕組みを使う場合は、VOL_SWITCH_DATE と、HTML側の
     対象カードの id（volCardOct / volCardNov）を書き換えてください。 */
  var VOL_SWITCH_DATE = new Date('2026-11-01T00:00:00');
  var volCardOct = document.getElementById('volCardOct');
  var volCardNov = document.getElementById('volCardNov');

  if (volCardOct && volCardNov) {
    var isNovOrLater = today.getTime() >= VOL_SWITCH_DATE.getTime();
    volCardOct.hidden = isNovOrLater;
    volCardNov.hidden = !isNovOrLater;
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
