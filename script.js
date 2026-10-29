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
     （切り替え前の旧月分・切り替え後の新月分）両方で呼び出すため。
     today は日付（日単位）比較専用に 0:00 へ丸めたもの。
     now は switchDate / expiresAt のような時刻付き日時との比較に
     使う、丸めていない「現在時刻」。 */
  var now = new Date();
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

  /* ---------- Scheduled monthly switch: メインエリア（#training 常駐スケジュール）＋ VOLカード ----------
     schedule-data.js の SCHEDULE_DATA.months を単一の情報源として、
     各月の「表示が有効になる時刻」(effectiveStart) を過ぎている
     active な月を古い順に適用する（後から適用した月が常駐スケジュール
     表を上書きするので、最終的に最新の月の日程が残る）。

     effectiveStart は、その月自身の switchDate（カレンダー上の月初め
     など）と、直前の月の expiresAt（直前の月の最終日程が終わる日時）
     のうち早い方。これにより、当月の最終日程が終わった瞬間に
     月末を待たず次月へ即座に昇格しつつ、仮に expiresAt の設定が漏れ
     ていても switchDate（月初め）で必ず切り替わるフェイルセーフが働く。

     月の追加・終了は schedule-data.js 側の編集のみで完結し、この
     ファイルを書き換える必要はない。 */
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

  if (typeof SCHEDULE_DATA !== 'undefined' && SCHEDULE_DATA.months) {
    var allMonths = SCHEDULE_DATA.months;

    var dueMonths = allMonths
      .filter(function (m) { return m.active !== false; })
      .map(function (m, i) {
        var starts = [];
        if (m.switchDate) starts.push(new Date(m.switchDate).getTime());

        var prev = allMonths[i - 1];
        if (prev && prev.expiresAt) starts.push(new Date(prev.expiresAt).getTime());

        var effectiveStart = starts.length ? Math.min.apply(null, starts) : -Infinity;
        return { month: m, effectiveStart: effectiveStart };
      })
      .filter(function (entry) { return now.getTime() >= entry.effectiveStart; })
      .sort(function (a, b) { return a.effectiveStart - b.effectiveStart; });

    dueMonths.forEach(function (entry) {
      renderScheduleList(scheduleDatesAMEl, entry.month.am, '午前');
      renderScheduleList(scheduleDatesPMEl, entry.month.pm, '午後');

      // 差し替え後、既に過ぎた日程がないか再チェック
      // （例: 月の中旬に初めて訪れた場合、前半の日程を自動でアーカイブする）
      archivePastScheduleDates();
    });

    // VOL.3カードのPDFボタンへリンクを反映（データファイルを唯一の情報源にする）
    var octEntry = allMonths.filter(function (m) { return m.id === 'oct-2026'; })[0];
    var novEntry = allMonths.filter(function (m) { return m.id === 'nov-2026'; })[0];
    var pdfBtn = document.getElementById('volNovPdfBtn');
    if (novEntry && novEntry.vol && novEntry.vol.pdfUrl && pdfBtn) {
      pdfBtn.setAttribute('href', novEntry.vol.pdfUrl);
    }

    /* ---------- VOLカード: 10月分の最終日程終了後、即座に非表示へ ----------
       それまでは VOL.2（10月・メイン）と VOL.3（11月・次回告知）を
       並べて表示。10月の expiresAt を過ぎたら、月末を待たずに即座に
       VOL.2 を非表示にし、VOL.3 が単独のメイン表示に昇格する。 */
    var volCardOct = document.getElementById('volCardOct');
    if (volCardOct && octEntry && octEntry.expiresAt) {
      volCardOct.hidden = now.getTime() >= new Date(octEntry.expiresAt).getTime();
    }
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
