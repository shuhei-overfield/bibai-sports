/* =========================================================
   OVERFIELD — 常駐スケジュール データ（#training / #upcoming 共通）
   -----------------------------------------------------------
   「美唄市総合体育館 常駐スケジュール」（#training 内の午前/午後の
   日程リスト）と、「OUR ACTIVITIES」→「トレーニング室のご案内」から
   辿れる #upcoming の VOLカード（VOL.2 / VOL.3 / VOL.4 ...）の表示
   切り替えの、単一の情報源（Single Source of Truth）。script.js が
   このファイルの内容を読み、該当月の日程・カード表示を自動的に
   切り替えます。

   各月オブジェクトのプロパティ:
   - switchDate: この月の日程を表示し始める「最も早い」日時
     （カレンダー上の月初めなど）。
   - expiresAt: この月の最終日程（am/pm の中で一番遅い日付）が
     終わったとみなす日時。これを過ぎたら、月末（switchDateの月初め）
     を待たずに即座に次の月へ切り替える。
   - 実際の切り替えタイミングは「switchDate」と「直前の月の
     expiresAt」のうち早い方。つまり、当月の最終日程が終わった瞬間に
     次月へ即時昇格し、仮に expiresAt の設定が漏れていても、次月の
     switchDate（月初め）には必ず切り替わる（フェイルセーフ）。
   - amLabel / pmLabel / amTime / pmTime（任意）: #training 常駐
     スケジュール表の見出し（「午前」「午後」）と時間帯表示を上書き
     する。通常の月は指定不要（前の月の表示がそのまま引き継がれる）。
     午後が「夜の部」になるなど、時間帯の性質が変わる月だけ指定する。
   - pmIcon（任意）: 同じく「午後」カードのアイコン（Font Awesomeの
     クラス名）を上書きする。夜の部なら月アイコンなどに差し替える。
   - vol（任意）: #upcoming のVOLカードと連動させる場合に指定する。
     - cardId: 対応するカードの要素ID（index.html側で付与）。
     - pdfBtnId: カード内のPDFダウンロードボタンの要素ID。
     - pdfUrl: そのPDFボタンの href。
     vol を持つ月が複数ある場合、script.js は「一番新しいvol月」の
     カードだけを常に表示し続け、それより古いvol月のカードは、その
     月の expiresAt を過ぎた時点で自動的に非表示にする。

   運用ルール:
   - 新しい月を追加する: 下の months 配列に1件追加するだけでよい
     （script.js・index.html のコード変更は不要）。VOLカードを伴う
     場合は、index.html 側に新しいカード（id付き）を追加し、この
     ファイルの vol.cardId / vol.pdfBtnId で紐付ける。
   - ある月の掲載を終了する: 該当エントリを削除する、または
     active: false にするだけでよい。
   - expiresAt は、その月の am/pm に含まれる最終日程の日付を基準に
     設定すること（時刻は厳密な終了時刻でなくてよく、「その日の
     営業終了」を表す程度のバッファを置くのが目安）。
   ========================================================= */

var SCHEDULE_DATA = {
  months: [
    {
      id: 'oct-2026',
      active: true,
      switchDate: '2026-10-02T00:00:00',
      // 10月の最終日程は am の10/26（月）。その日の営業終了（18:00）を
      // もって10月分の掲載を終了し、11月分へ即時切り替える。
      expiresAt: '2026-10-26T18:00:00',
      am: [
        { date: '2026-10-05', time: '9:30', text: '10/5', weekday: '（月）' },
        { date: '2026-10-26', time: '9:30', text: '10/26', weekday: '（月）' }
      ],
      pm: [
        { date: '2026-10-08', time: '15:30', text: '10/8', weekday: '（木）' },
        { date: '2026-10-15', time: '15:30', text: '10/15', weekday: '（木）' }
      ],
      // #upcoming の VOL.2カード（index.html 内, id="volCardOct"）と連動。
      // PDFボタンは無いため pdfBtnId / pdfUrl は指定しない。
      vol: {
        cardId: 'volCardOct'
      }
    },
    {
      id: 'nov-2026',
      active: true,
      switchDate: '2026-11-01T00:00:00',
      // 11月の最終日程は am の11/30（月、9:30〜12:00）。その終了時刻
      // （12:00）をもって11月分の掲載終了タイミングとする。
      expiresAt: '2026-11-30T12:00:00',
      am: [
        { date: '2026-11-02', time: '9:30', text: '11/2', weekday: '（月）' },
        { date: '2026-11-09', time: '9:30', text: '11/9', weekday: '（月）' },
        { date: '2026-11-16', time: '9:30', text: '11/16', weekday: '（月）' },
        { date: '2026-11-30', time: '9:30', text: '11/30', weekday: '（月）' }
      ],
      pm: [
        { date: '2026-11-26', time: '15:30', text: '11/26', weekday: '（木）' }
      ],
      // #upcoming の VOL.3カード（index.html 内, id="volCardNov"）と連動。
      // カード本文は静的HTMLなので、内容変更時はそちらも合わせて更新すること。
      vol: {
        label: 'VOL.3',
        period: '11月開催分',
        cardId: 'volCardNov',
        pdfBtnId: 'volNovPdfBtn',
        pdfUrl: 'training-vol3.pdf'
      }
    },
    {
      id: 'dec-2026',
      active: true,
      switchDate: '2026-12-01T00:00:00',
      // 12月の最終日程は am の12/21（月、9:30〜12:00）。その終了時刻
      // （12:00）をもって12月分の掲載終了タイミングとする。
      expiresAt: '2026-12-21T12:00:00',
      // 12月は「午後」ではなく「夜の部」（18:00〜20:30）のため、
      // #training 常駐スケジュール表の見出し・時間帯・アイコンを上書きする。
      pmLabel: '夜',
      pmTime: '18:00 〜 20:30',
      pmIcon: 'fa-regular fa-moon',
      am: [
        { date: '2026-12-07', time: '9:30', text: '12/7', weekday: '（月）' },
        { date: '2026-12-14', time: '9:30', text: '12/14', weekday: '（月）' },
        { date: '2026-12-21', time: '9:30', text: '12/21', weekday: '（月）' }
      ],
      pm: [
        { date: '2026-12-18', time: '18:00', text: '12/18', weekday: '（金）' }
      ],
      // #upcoming の VOL.4カード（index.html 内, id="volCardDec"）と連動。
      // カード本文は静的HTMLなので、内容変更時はそちらも合わせて更新すること。
      vol: {
        label: 'VOL.4',
        period: '12月開催分',
        cardId: 'volCardDec',
        pdfBtnId: 'volDecPdfBtn',
        pdfUrl: 'training-vol4.pdf'
      }
    }
  ]
};
