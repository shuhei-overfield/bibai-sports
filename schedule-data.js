/* =========================================================
   OVERFIELD — 常駐スケジュール データ（#training セクション用）
   -----------------------------------------------------------
   「美唄市総合体育館 常駐スケジュール」（#training 内の午前/午後の
   日程リスト）を駆動する、単一の情報源（Single Source of Truth）。
   script.js がこのファイルの内容を読み、該当月の日程を自動的に
   描画・切り替えます。

   運用ルール:
   - 新しい月を追加する: 下の months 配列に1件追加するだけでよい
     （script.js・index.html のコード変更は不要）。switchDate 以降、
     自動的にその月の日程が表示される。
   - ある月の掲載を終了する: 該当エントリを削除する、または
     active: false にするだけでよい。
   - 複数の active な月の switchDate をすでに過ぎている場合は、
     switchDate が最も新しい（直近の）月の日程が採用される
     （例: 11月に訪問した場合、10月分を描画した後、11月分で上書き
     されるため、最終的に11月分が表示される）。

   注意: このファイルが駆動するのは #training セクションの
   「常駐スケジュール」表のみ。「OUR ACTIVITIES」→「トレーニング室の
   ご案内」から辿れる #upcoming の VOLカード（VOL.2 / VOL.3 の告知
   カード）は、常時すべて並べて掲載する運用（自動非表示にしない）の
   ため、index.html 内に直接記述された静的HTMLのまま。VOLカードの
   日程文言を変更する場合は、index.html 側のカードと、このファイルの
   該当月のデータの両方を更新すること（vol.pdfUrl のみ、VOL.3カード
   のPDFボタンの href に script.js が自動反映する）。
   ========================================================= */

var SCHEDULE_DATA = {
  months: [
    {
      id: 'oct-2026',
      active: true,
      switchDate: '2026-10-02T00:00:00',
      am: [
        { date: '2026-10-05', time: '9:30', text: '10/5', weekday: '（月）' },
        { date: '2026-10-26', time: '9:30', text: '10/26', weekday: '（月）' }
      ],
      pm: [
        { date: '2026-10-08', time: '15:30', text: '10/8', weekday: '（木）' },
        { date: '2026-10-15', time: '15:30', text: '10/15', weekday: '（木）' }
      ]
    },
    {
      id: 'nov-2026',
      active: true,
      switchDate: '2026-11-01T00:00:00',
      am: [
        { date: '2026-11-02', time: '9:30', text: '11/2', weekday: '（月）' },
        { date: '2026-11-09', time: '9:30', text: '11/9', weekday: '（月）' },
        { date: '2026-11-16', time: '9:30', text: '11/16', weekday: '（月）' },
        { date: '2026-11-30', time: '9:30', text: '11/30', weekday: '（月）' }
      ],
      pm: [
        { date: '2026-11-26', time: '15:30', text: '11/26', weekday: '（木）' }
      ],
      // #upcoming の VOL.3カード（index.html 内, id="volCardNov"）と対応する参考情報。
      // カード本文は静的HTMLなので、内容変更時はそちらも合わせて更新すること。
      // pdfUrl のみ、script.js が #volNovPdfBtn の href に自動反映する。
      vol: {
        label: 'VOL.3',
        period: '11月開催分',
        place: '美唄市総合体育館 トレーニング室',
        fee: '施設利用料のみ（事前予約不要）',
        items: '動きやすい服装、室内シューズ、タオル、飲み物',
        support: '体組成測定、マシンの正しい使い方、個別アドバイス',
        pdfUrl: 'training-vol3.pdf'
      }
    }
  ]
};
