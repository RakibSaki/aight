let s;
let r;
let v;
const G = 6.6743e-11;
let sm = 1.989e30, m = 5.972e24;
let maxv, pocot;
let play = false, resetting = false, selected = 0;
let phi = 0;

let a, b, fd, ecc, T, foci, c, am, bm;
let hyperbolic = false;

let zoom = 1;
let sscale = 7.5e8;
let tscale = 1e5;
let vscale = sscale / tscale;
let Ek, Egrav, minEgrav, maxEk;

let test = "waiting";


function setup() {
    //frameRate(1);
    createCanvas(1150, 600);
    background(0);
    s = createVector(400, 300);
    r = createVector(-1.521e11, 0);
    v = createVector(0, -2.929e4);
    cale();
    playbutton = createButton('play', 'play');
    playbutton.position(0, 0);
    playbutton.style('color', 'white');
    playbutton.style('backgroundColor', 'red');
    playbutton.style('borderStyle', 'none');
    playbutton.style('fontSize', '18');
    playbutton.mouseClicked(() => {
        play = !play;
        playbutton.html(play ? 'pause' : 'play');
    });

    resetbutton = createButton('reset', 'reset');
    playbutton.style('borderStyle', 'none');
    resetbutton.style('fontSize', 18);
    resetbutton.position(0, height - 27);
    resetbutton.mouseClicked(() => {
        resetting = !resetting;
        if (resetting) {
            play = false;
            time = 0;
        }
    });
}

let smouseX, smouseY;
let svalue;
let changenow;

function mousePressed() {
    if (resetting) {
        smouseX = mouseX;
        smouseY = mouseY;
        if (selected == 0) {
            svalue = createVector(r.x + 0, r.y + 0);
        } else if (selected == 1) {
            svalue = createVector(v.x + 0, v.y + 0);
        } else if (selected == 2) {
            svalue = sm + 0;
        } else if (selected == 3) {
            svalue = m + 0;
        }
        changenow = true;
    }
}

function mouseDragged() {

    if (resetting && changenow) {
        time = 0;
        let delx = mouseX - smouseX;
        let dely = mouseY - smouseY;
        let del = createVector(delx, dely);
        if (selected == 0) {
            r = p5.Vector.add(svalue, p5.Vector.mult(del,sscale));
            if (r < 50 * sscale) {
                p5.Vector.mult(r, 50*sscale/r.mag());
            }

        } else if (selected == 1) {
            v = p5.Vector.add(svalue, p5.Vector.mult(del,vscale * 0.001));
        } else if (selected == 2) {
            sm = sm + (del * 1e27);
            if (sm < 100) {
                sm = 100;
            }
        } else if (selected == 3) {
            m = m + (del * 1e23 * 3);
        }
        cale();
    }
}

function mouseReleased() {
    changenow = false;
}

function cale() {
    if (r.y == 0 && v.x == 0) {
        hyperbolic = false;
        Ek = 0.5 * m * v.mag() * v.mag();
        Egrav = -G * sm * m / r.mag();
        if (Ek / (-Egrav) < 0.5) {
            ecc = (0.5 - (Ek / -Egrav)) * 2;
            fd = (ecc * r.mag()) / (1 + ecc);
            a = r.mag() - fd;
            b = Math.sqrt(sq(a) - sq(fd));
            foci = p5.Vector.mult(r, (fd+fd)/r.mag());
            c = p5.Vector.mult(foci, 0.5);
            am = a + a;
            bm = b + b;
            minEgrav = -G * sm * m / (am - r.mag());
            maxEk = Ek + Egrav - minEgrav;
            maxv = Math.sqrt(maxEk / (0.5 * m));
        } else if (Ek / (-Egrav) > 0.5 && Ek / (-Egrav) < 1) {
            ecc = ((Ek / (-Egrav)) - 0.5) * 2;  //0.3
            fd = (ecc * r.mag()) / (1 - ecc);
            a = r.mag() + fd;
            b = Math.sqrt(sq(a) - sq(fd));
            foci = p5.Vector.mult(r, -(fd+fd)/r.mag());
            c = p5.Vector.mult(foci, 0.5);
            am = a + a;
            bm = b + b;
            maxv = Math.sqrt(Ek / (0.5 * m));
        } else if (Ek / -Egrav == 0.5) {
            ecc = 0;
            fd = 0;
            a = r.mag();
            b = a+0;
            foci = createVector(0, 0);
            c = createVector(0, 0);
            am = a + a;
            bm = b + b;
            maxv = v.mag();
        } else {
            hyperbolic = true;
        }
        T = Math.sqrt((39.478417604 * a * a * a) / (G * sm));
        pocot = 1 / maxv;
    } else {
        console.log("can't predict orbit ¯\_(<_<)_/¯");
    }
}

function draw() {
    background(0);

    translate(s.x, s.y);
    scale(zoom);
    orbit();
    planet();
    star();
    scale(1 / zoom);
    translate(-s.x, -s.y);
    if (play) {
        move();
    }
    fill(255);
    text(maxv, 50, 100);
    //buttons();
    varplay();
    stroke(200);
    line(800, 0, 800, height);
}

let margin = 25;
let ls = 22;
let variablestoshow = ["distance / m", "speed / m/s", "gravitational attraction / N", "acceleration / m/s/s", "gravitational potential energy / J", "kinetic energy / J", "total energy / J", "momentum / kg.m/s",/* "angular speed", "angular momentum", "\"centrifugal\" force",*/ "mass of star / kg", "mass of planet / kg"];
let variablestoshow2 = ["eccentricity", "semi-major axis / m", "semi-minor axis / m", "focal distance / m", "period of orbit / s"];

function varplay() {    // variables display=
    fill(225);
    let tx = 800 + margin, ty = 60;
    let f = p5.Vector.mult(r, (-1/r.mag() * G * sm * m / (r.mag() * r.mag())));
    let Ek = 0.5 * m * v.mag() * v.mag();
    let Egrav = -f.mag() * r.mag();
    let ts = 0;  // tangential speed
    let variablestoshowv = [r.mag(), v.mag(), f.mag(), f.mag() / m, Egrav, Ek, Ek + Egrav, m * v.mag(),/* ts / r, ts*m*r, 0,*/ sm, m];
    for (let iterator = 0; iterator < variablestoshow.length; iterator++) {
        noStroke();
        ty += ls;
        text(variablestoshow[iterator], tx, ty);
        textAlign(RIGHT);
        text(Number.parseFloat(variablestoshowv[iterator]).toPrecision(4), width - margin, ty);
        textAlign(LEFT);
        stroke(30);
        line(800 + margin, ty - 16, width - margin, ty - 16);
    }
    if (!hyperbolic) {
        ty = height - 60;
        variablestoshowv = [ecc, a, b, fd, T];
        for (let iterator = 0; iterator < variablestoshow2.length; iterator++) {
            noStroke();
            ty -= ls;
            text(variablestoshow2[iterator], tx, ty);
            textAlign(RIGHT);
            text(Number.parseFloat(variablestoshowv[iterator]).toPrecision(4), width - margin, ty);
            textAlign(LEFT);
            stroke(30);
            line(800 + margin, ty - 16, width - margin, ty - 16);
        }
    }
}

function move() {
    times = Math.ceil(maxv * 1000 / vscale);
    for (let iterator = 0; iterator < times; iterator++) {
        moves(tscale / times);
    }
}

function moves(smallt) {
    test = true;
    //smallt *= tscale;
    let f = p5.Vector.mult(r, (-1/r.mag() * G * sm * m / (r.mag() * r.mag())));
    acc = p5.Vector.mult(f, 1/m);
    // x = x + (vx * smallt) + (0.5 * ax * smallt * smallt);
    // y = y + (vy * smallt) + (0.5 * ay * smallt * smallt);
    r= p5.Vector.add(r, (  p5.Vector.add(p5.Vector.mult(v, smallt), p5.Vector.mult(acc, 0.5 * smallt * smallt))));
    // vx = vx + (ax * smallt);
    // vy = vy + (ay * smallt);
    v = p5.Vector.add(v, p5.Vector.mult(acc, smallt));
}

function orbit() {
    if (!hyperbolic) {
        rotate(phi);
        noFill();
        stroke(150);
        ellipse(c.x / sscale, c.y / sscale, am / sscale, bm / sscale);
        stroke(50);
        line(foci.x / sscale, foci.y / sscale, r.x / sscale, r.y / sscale);
        line(0, 0, r.x / sscale, r.y / sscale);
        rotate(-phi);
    }
}

function planet() {
    fill('#1EF54E');
    noStroke();
    ellipse(r.x / sscale, r.y / sscale, 12, 12);
}

function star() {
    let sw = 50;
    let wr = sw / 2;
    for (let ww = sw; ww >= wr; ww -= 2 / zoom) {
        let ratio = (sw - ww) / wr;
        fill(255 * ratio, 255 * ratio, 255 * ratio);
        ellipse(0, 0, ww, ww);
    }
}

function Py(a, b) {
    return Math.sqrt((a * a) + (b * b));
}

