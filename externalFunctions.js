function findzero(arr) {
  var id = [0] //becomes array, just number w/o []
  var k = 0
  for (let i = 0; i < (arr.length - 1); i++) {
    if (Math.sign(arr[i]) == 0) {
      id[k] = i
      k++
    } else if (Math.sign(arr[i]) != Math.sign(arr[i + 1])) {
      id[k] = i
      k++
    }
  }
  return id
}
 
function calcMtrl(f_cm,E_cm,f_yd,E_s) {

  eps_cu = 3.5e-3;
  eps_c1 = (0.7 * (f_cm * 1e-6) ** 0.31) * 1e-3;
  eps_c2 = 2e-3;
  eps_c3 = 1.75e-3;
  
  eps_c = math.range(0, eps_cu, eps_cu / 100, true)._data;
  var n = math.divide(eps_c, eps_c1);
  var k = 1.05 * E_cm * math.abs(eps_c1) / f_cm;
  var a = math.multiply(f_cm, math.subtract(math.multiply(k, n), math.square(n)));
  var b = math.add(math.multiply(k - 2, n), 1);
  sigma_c = math.dotDivide(a, b);

  eps_sy = f_yd / E_s;
  eps_s = math.range(0, 2e-2, 2e-2 / 100,true)._data
  mtrl_sigma_s = [];
  for (let i = 0; i < eps_s.length; i++) {
    if (eps_s[i] <= eps_sy) {
      mtrl_sigma_s[i] = eps_s[i] * E_s;
    } else {
      mtrl_sigma_s[i] = f_yd;
    }
  }
  return {sigma_s:mtrl_sigma_s,
    eps_s: eps_s,
    sigma_c: sigma_c,
    eps_c: eps_c}
}

function calcGeometry(geo) {
  //Geometry and reinforcement
  geo.A_s = geo.nbars * (geo.dbar / 2) ** 2 * Math.PI;
  //calculate d and d_p from geometry
  let w = geo.b
  let h = geo.h;
  let nbars = geo.nbars;
  let dbar = geo.dbar;
  let nmax = math.floor((w - 2 * (dbar + 0.01)) / (2 * dbar))
  if (nbars <= nmax) {
    layers = 1;
    layer1 = nbars;
    d = h - (1.5 * dbar + 0.01);
  }
  else if (nbars > nmax) {
    let layers = 2;
    layer1 = nmax;
    layer2 = nbars - nmax;
    d = h - (layer2 * (2.5 * dbar + 0.01) + layer1 * (1.5 * dbar + 0.01)) / (nbars)
  }

  //x-y-location of bottom bars
  var barXSpace = (w - (3 * dbar + (2 * 0.01)));
  if (nbars > nmax && layer2 > 1) {
    var x_bar1 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
    var x_bar2 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer2 - 1), true)._data
    var x_bar = x_bar1.concat(x_bar2);
  }
  else if (nbars > nmax && layer2 == 1) {
    var x_bar1 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
    var x_bar = x_bar1.concat([w / 2]);
  }
  else if (nbars <= nmax) {
    var x_bar = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
  }

  var y_bar = []
  for (let i = 0; i <= nbars; i++) {
    if (i < nmax) {
      y_bar[i] = dbar + 0.01 + 0.5 * dbar;
    }
    else {
      y_bar[i] = dbar + 0.01 + 0.5 * dbar + dbar + dbar;
    }
  }

  //draw cross section
  section_geom = [
    {
      type: 'rect', x0: 0, y0: 0, x1: w, y1: h, line: { color: 'rgba(0, 0, 0, 1)', width: 2 }, fillcolor: 'rgba(150, 150, 150, 0.7)',
    },
  ]

  //draw bottom bars
  var new_circle = [];
  for (let i = 0; i < nbars; i++) {
    new_circle[i] = {
      type: 'circle', x_ref: 1, y_ref: 1, x0: x_bar[i] - 0.5 * dbar, y0: y_bar[i] - 0.5 * dbar, x1: x_bar[i] + 0.5 * dbar, y1: y_bar[i] + 0.5 * dbar, fillcolor: 'rgba(0, 0, 0, 1)',
    }
  }
  section_geom = section_geom.concat(new_circle)

  //draw bottom bars
  var new_circle = [];
  for (let i = 0; i < nbars; i++) {
    new_circle[i] = {
      type: 'circle', x_ref: 1, y_ref: 1, x0: x_bar[i] - 0.5 * dbar, y0: y_bar[i] - 0.5 * dbar + 0.5, x1: x_bar[i] + 0.5 * dbar, y1: y_bar[i] + 0.5 * dbar + 0.5, fillcolor: 'rgba(0, 0, 0, 1)',
    }
  }
  section_geom = section_geom.concat(new_circle)
  geo.sectionGeom = section_geom;
  geo.d = d;
  return geo
}

function average(arg) {
  return arg.reduce((a,b) => a+b) / arg.length
}

function CoG(xvec,yvec) {
  //multiply x,y element-wise
  A = xvec.map((a,i) => a * yvec[i])
  A = A.reduce((a,b) => a+b,0) 
  B = yvec.reduce((a,b) => a+b,0)
  xtp = A/B
  return xtp
}
