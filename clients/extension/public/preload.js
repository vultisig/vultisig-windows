(function() {
  var status = document.getElementById('load-status');
  var loaded = 0;
  var names = {
    'wallet-core.wasm': 'wallet-core.wasm (10 MB)',
    'fromt_wasm_bg.wasm': 'fromt-wasm (1.4 MB)',
    'frozt_wasm_bg.wasm': 'frozt-wasm (940 KB)',
    'vs_wasm_bg.wasm': 'vs-wasm (10 MB)',
    'vs_wasm_bg2.wasm': 'vs-wasm (552 KB)',
    'vs_schnorr_wasm_bg.wasm': 'schnorr-wasm (739 KB)',
    'secp256k1.wasm': 'secp256k1.wasm (1.2 MB)',
    '7zz.wasm': '7z.wasm (1.6 MB)',
    'zxing_reader.wasm': 'zxing.wasm',
    'ActiveView.js': 'app bundle (14 MB)',
    'index.js': 'core bundle (3 MB)',
  };
  var total = Object.keys(names).length;
  var observer = new PerformanceObserver(function(list) {
    list.getEntries().forEach(function(entry) {
      var url = entry.name || '';
      var file = url.split('/').pop().split('?')[0];
      if (names[file]) {
        loaded++;
        status.textContent = 'Loaded: ' + names[file] + ' (' + loaded + '/' + total + ')';
        delete names[file];
      }
    });
  });
  observer.observe({ type: 'resource', buffered: true });
})();
