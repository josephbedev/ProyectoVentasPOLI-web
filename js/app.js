$(function () {
  var NOM = ['Carlos','Laura','Andrés','Camila','Juan','Valentina','Sofía','Miguel','Daniela','Felipe'],
      APE = ['Gómez','Rodríguez','Martínez','López','Pérez','Ramírez','Torres','Herrera','Castro','Rojas'],
      PRO = ['Portátil','Mouse','Teclado','Monitor','Audífonos','Cámara web','Disco SSD','Impresora','Tablet','Parlante','Router','Memoria USB','Cargador','Micrófono','Silla ergonómica'],
      KEY = 'ventasPOLI', D;
  var rnd = function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
      pick = function (a) { return a[rnd(0, a.length - 1)]; },
      money = function (n) { return '$' + n.toLocaleString('es-CO'); },
      full = function (v) { return v.nombres + ' ' + v.apellidos; };

  function generar() {
    var d = { productos: [], vendedores: [], ventas: {} };
    $.each(PRO, function (i, n) { d.productos.push({ id: 'P' + (101 + i), nombre: n, precio: rnd(20, 400) * 1000 }); });
    for (var i = 0; i < 8; i++) {
      var v = { tipo: pick(['CC', 'CE', 'TI']), doc: String(rnd(10000000, 1099999999)), nombres: pick(NOM), apellidos: pick(APE) + ' ' + pick(APE) };
      d.vendedores.push(v);
      d.ventas[v.doc] = [];
      for (var j = rnd(4, 10); j > 0; j--) d.ventas[v.doc].push({ id: pick(d.productos).id, cant: rnd(1, 9) });
    }
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
    return d;
  }
  try { D = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!D) D = generar();

  var prod = function (id) { return $.grep(D.productos, function (p) { return p.id === id; })[0]; };
  function total(doc) {
    var t = 0, u = 0;
    $.each(D.ventas[doc], function (_, l) { t += prod(l.id).precio * l.cant; u += l.cant; });
    return { t: t, u: u };
  }
  function descargar(nombre, texto) {
    var a = $('<a>').attr({ href: URL.createObjectURL(new Blob([texto], { type: 'text/plain' })), download: nombre }).appendTo('body');
    a[0].click(); a.remove();
  }
  function tabla(rows, cols, fmt) {
    var h = '';
    $.each(rows, function (_, r) {
      h += '<tr>' + $.map(cols, function (c) { return '<td>' + (fmt && fmt[c] ? fmt[c](r[c]) : r[c]) + '</td>'; }).join('') + '</tr>';
    });
    $('#tbl tbody').html(h || '<tr><td colspan="9">Sin resultados</td></tr>');
  }
  function listado(data, cols, fmt) {
    var asc = 1;
    function pintar() {
      var q = $('#q').val().toLowerCase();
      tabla($.grep(data, function (r) { return JSON.stringify(r).toLowerCase().indexOf(q) > -1; }), cols, fmt);
    }
    $('#q').on('input', pintar);
    $('th[data-k]').on('click', function () {
      var k = $(this).data('k'); asc = -asc;
      data.sort(function (a, b) { return (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * asc; });
      pintar();
    });
    pintar();
  }

  var page = $('body').data('page');
  $('nav a').each(function () { if (this.href.indexOf(page === 'home' ? 'index' : page) > -1) $(this).addClass('active'); });

  if (page === 'home') {
    var sum = 0, rk = $.map(D.vendedores, function (v) { var x = total(v.doc); sum += x.t; return { n: full(v), u: x.u, t: x.t }; })
      .sort(function (a, b) { return b.t - a.t; });
    var cards = [['Productos', D.productos.length], ['Vendedores', D.vendedores.length], ['Total vendido', money(sum)], ['Mejor vendedor', rk[0].n]];
    $('#cards').html($.map(cards, function (c) { return '<div class="card"><span>' + c[0] + '</span><b>' + c[1] + '</b></div>'; }).join(''));
    $('.card').each(function (i) { $(this).delay(i * 120).fadeIn(400); });
    $('#rank tbody').html($.map(rk, function (r, i) { return '<tr><td>' + (i + 1) + '</td><td>' + r.n + '</td><td>' + r.u + '</td><td>' + money(r.t) + '</td></tr>'; }).join(''));
  }
  if (page === 'productos') {
    listado(D.productos, ['id', 'nombre', 'precio'], { precio: money });
    $('.dl').on('click', function () { descargar('productos.txt', $.map(D.productos, function (p) { return [p.id, p.nombre, p.precio].join(';'); }).join('\n')); });
  }
  if (page === 'vendedores') {
    listado(D.vendedores, ['tipo', 'doc', 'nombres', 'apellidos']);
    $('.dl').on('click', function () { descargar('vendedores.txt', $.map(D.vendedores, function (v) { return [v.tipo, v.doc, v.nombres, v.apellidos].join(';'); }).join('\n')); });
  }
  if (page === 'ventas') {
    $('#sel').html($.map(D.vendedores, function (v) { return '<option value="' + v.doc + '">' + full(v) + ' (' + v.doc + ')</option>'; }).join(''))
      .on('change', function () {
        var doc = this.value, rows = $.map(D.ventas[doc], function (l) { var p = prod(l.id); return { id: l.id, nombre: p.nombre, cant: l.cant, sub: p.precio * l.cant }; });
        tabla(rows, ['id', 'nombre', 'cant', 'sub'], { sub: money });
        $('#tot').hide().text('Total del vendedor: ' + money(total(doc).t)).fadeIn(300);
      }).trigger('change');
    $('.dl').on('click', function () {
      var doc = $('#sel').val(), v = $.grep(D.vendedores, function (x) { return x.doc === doc; })[0];
      descargar('ventas_' + v.nombres + '_' + doc + '.txt', v.tipo + ';' + doc + '\n' + $.map(D.ventas[doc], function (l) { return l.id + ';' + l.cant + ';'; }).join('\n'));
    });
  }
  $('#regen').on('click', function () { generar(); location.reload(); });
});
