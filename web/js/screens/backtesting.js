/* Bereich Backtesting (Bereichsleiste ganz links): eigener Bereich neben dem Journal, Inhalt folgt */
(function (root) {
  'use strict';
  const App = root.App, I = root.UI.I;
  App.screens.backtesting = {
    title: 'Backtesting',
    head: { range: false, account: false, session: false, trade: false },
    render() {
      return `<div class="card bt-soon"><div class="empty"><span class="bt-ico">${I.backtest}</span><h3>Backtesting</h3><p>Dieser Bereich wird gerade aufgebaut.</p></div></div>`;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
