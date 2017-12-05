var INSERT_YOUR_LOCAL_IP_HERE = "192.168.1.192";

var socket = io.connect(INSERT_YOUR_LOCAL_IP_HERE+':8080');

let points = new Map();

socket.on('update', function(data){
    //console.log(points);
    for(let p of points.values()) {
        p.updated = false;
    }
    for (var i = 0; i < data.players.length; i++) {
        var player = data.players[i];
        if (!points.has(player.id)){
            points.set(player.id, new Point(player.x,player.y,player.hp,player.a, player.t));
        } else {
            points.get(player.id).update(player.x,player.y,player.hp,player.a, player.t,player.ry);
            points.get(player.id).updated = true;
        }
        if (player.false_data == 1){
            points.get(player.id).falsedata = true;
        } else {
            points.get(player.id).falsedata = false;
        }
    }
    for(let k of points.keys()) {
        if (!points.get(k).updated){
            points.delete(k);
        }
    }
});



class Map_{
    constructor(name, cx, cy, k){
        this.name = name;
        this.cx = cx;
        this.cy = cy;
        this.k = k;
    }
    getrx(x){
        return (x - this.cx)/this.k;
    }
    getry(y){
        return (-y + this.cy)/this.k;
    }
    getdx(x){
        return (x*this.k + this.cx);
    }
    getdy(y){
        return (-y*this.k + this.cy);
    }
}

class Point{
    constructor(x,y,hp,arm,team){
        this.x = x;
        this.y = y;
        this.rx = 0;
        this.ry = 0;
        this.r = 12;
        this.c = 0;
        this.s = 0;
        this.v = 0;
        this.armor = arm;

        this.history = [];

        this.falsedata = false;

        this.updated = true;

        this.name = '';
        this.hp = hp;
        this.team = team;

        this.targetx = 0;
        this.targety = 0;


    }
    render_rotate(){
        if (ui.rotatingway){
            angleMode(DEGREES);
            let stick_k = 1.2;
            stroke(255,255,255,170);
            strokeWeight(2);
            if (!ui.twostickrotating){
                var v = createVector(10, 10);
                v.rotate(this.ry);
                let pos = createVector(this.x, this.y);
                let k = pos.sub(v);
                line(this.x, this.y, k.x, k.y);
                line(this.x, this.y, k.x, k.y);
            } else {
                var v1 = createVector(10, 10);
                v1.rotate(this.ry-30);
                let pos = createVector(this.x, this.y);
                let k = pos.sub(v1);
                line(this.x, this.y, k.x, k.y);

                var v2 = createVector(10, 10);
                v2.rotate(this.ry+30);
                pos = createVector(this.x, this.y);
                k = pos.sub(v2);
                line(this.x, this.y, k.x, k.y);
            }
            noStroke();
        }
        //translate((this.x+40+this.x)/2, (this.y+40+this.y)/2);
        //rotate(this.ry);
        //line(this.x,this.y, this.x+40, this.y+40);

        //rotate(-this.ry);
        //translate(0,0);
    }
    update(x,y,hp,arm,team,ry){
        //if (ry < 0){
            //ry = 180+(-ry)
        //}
        this.arm = arm;
        this.ry = lerp(this.ry,(ry*-1)-225,1);
        this.target(ui.map.getdx(x),ui.map.getdy(y));
        this.hp = hp;
        this.team = team;
        this.v = (this.x - this.targetx)*(this.x - this.targetx) + (this.y - this.targety)*(this.y - this.targety)
        if (this.team == 2){
            this.c = 'rgba(255,0,0,.9)';
        } else if(this.team == 3){
            this.c = 'rgba(0,0,255,.9)';
        }
    }
    target(x,y){
        //console.log(x,y);
        this.targetx = x;
        this.targety = y;

        //ui.pos_val.value = x +' ' + y
        //this.x = x;
        //this.y = y;
    }
    move(){
        //console.log(this.x);
        //this.x = this.targetx;
        //this.y = this.targety;
        if (this.v <= 3000){
            this.x = lerp(this.x,this.targetx,.07);
            this.y = lerp(this.y,this.targety,.07);
        } else {
            this.x = lerp(this.x,this.targetx,1);
            this.y = lerp(this.y,this.targety,1);
        }
        if (ui.showtrail){
            let pos = {
                x: this.x,
                y: this.y
            }
            this.history.push(pos);
            if (this.history.length >= 40){
                this.history.splice(0,1);
            }
        }
    }
    lookfor(){
        let ar = ui.pos_val.value.split(" ");
        let bx = parseFloat(ar[0]);
        let by = parseFloat(ar[1]);
        if (typeof(bx) == "number" && typeof(by) == "number"){
            this.x = bx;
            this.y = by;
        }
    }
    render_info(){
        if (!this.falsedata && this.hp != 0){
            if (ui.showinfosquare){
                fill(255,255,255,150);
                rect(this.x-32, this.y-25, 66,17);
            }
            fill(100-this.hp, this.hp, 0);
            let data = this.hp + ' / '+this.arm;
            if (this.team == 2 && ui.showhpt1 && this.hp != 0){
                text(data, lerp(this.x,this.targetx,.01), lerp(this.y,this.targety,.01)-10);
            } else if (this.team == 3 && ui.showhpt2  && this.hp != 0){
                text(data, lerp(this.x,this.targetx,.01), lerp(this.y,this.targety,.01)-10);
            }
        }
    }
    render_trail(){
        if (ui.showtrail && this.hp != 0){
            for (let i = 0; i < this.history.length; i++){
                let c_buf;
                if (this.team == 2){
                    c_buf = 'rgba(255,0,0,.2)';
                } else if(this.team == 3){
                    c_buf = 'rgba(0,0,255,.2)';
                }
                //'rgba(255,0,0,.9)'
                fill(c_buf);
                ellipse(this.history[i].x, this.history[i].y, 5, 5);
            }
        }

    }
    render(){
        //console.log(this.x, this.y);
        this.move();

        //this.lookfor();
        //this.randomMove();
        //stroke(this.s);

        textSize(15);
        textAlign(CENTER);
        textStyle(BOLD);

        //stroke(200,200,200);

        noStroke();
        if (this.hp != 0){
            let p_clr_buf;

            if (this.falsedata && !ui.showfalsepos){
                p_clr_buf = 'rgba(0,0,0,0)';
            }
            else if (this.falsedata){
                p_clr_buf = 'rgba(0,0,0,.9)';
            } else {
                this.render_rotate();
                p_clr_buf = this.c;
            }

            fill(p_clr_buf);
            ellipse(this.x,this.y,this.r,this.r);

        }

    }
}

let maps = new Map();
let img;

d1 = 100;
d2 = 300;

maps.set('office', new Map_('office', 231,238.39999771118164,0.0970009999962204428972690806487505));
maps.set('dust2', new Map_('dust2', 274,380,0.0970009999962204428972690806487505));
maps.set('mirage', new Map_('mirage', 319.2,176.0,0.0970009999962204428972690806487505));

/*let ui = {
    map: ,
    pos_val: document.getElementById('pos'),
    cw: 512,
    ch: 512,
    r: 12,
    showhpt1: true,
    showhpt2: true,
    init: function(){
        function update_settings(t_, val){
            console.log(t_,val);
        }
        document.getElementById('thp').onchange = update_settings('thp',document.getElementById('thp').value);
    }.bind(this)

}*/

class UI{
    constructor(){
        this.map = maps.get('mirage');
        this.cw = 512;
        this.ch = 512;
        this.r = 12;
        this.showhpt1 = true;
        this.showhpt2 = true;
        this.showfalsepos = true;
        this.showinfosquare = true;
        this.showtrail = false;
        this.twostickrotating = true;
        this.rotatingway = true;
        this.pos_val =  document.getElementById('pos');

        this.setts = ['thp','cthp','fp', 'sq', 'tr','2srw','rw'];
    }
    update_settings(t_, val){

        if (t_ == 'thp'){
            this.showhpt1 = val;
        } else if (t_ == 'cthp'){
            this.showhpt2 = val;
        } else if (t_ == 'fp'){
            this.showfalsepos = val;
        } else if (t_ == 'sq'){
            this.showinfosquare = val;
        } else if (t_ == 'tr'){
            this.showtrail = val;
            for(let p of points.values()) {
                p.history = [];
            }
        } else if (t_ == '2srw'){
            this.twostickrotating = val;
        } else if (t_ == 'rw'){
            this.rotatingway = val;
        }
    }
    init (){
        for (let i = 0; i < this.setts.length; i++ ){
            let curr = this.setts[i];
            document.getElementById(curr).onchange = function(){
                 this.update_settings(curr,document.getElementById(curr).checked)
            }.bind(this);
        }

    }
}

ui = new UI();

ui.init();



/*let indata = {
    p1: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 1
    },
    p2: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 1
    },
    p3: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 1
    },
    p4: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 1
    },
    p5: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 1
    },
    p6: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 2
    },
    p7: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 2
    },
    p8: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 2
    },
    p9: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 2
    },
    p10: {
        x: random(d1, d2),
        y: random(d1, d2),
        t: 2
    }
}*/

//points.set('p1',new Point(50,50,12,'rgba(0,255,0,1)','rgba(0,0,0,0)'));
let players = [ [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,2],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,2],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,2],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,2],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,2],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,3],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,3],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,3],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,3],
                [Math.random() * (d2 - d1) + d1,Math.random() * (d2 - d1) + d1,3],
];

//for (let i = 0; i < 10; i++){
    //points.set(i, new Point(players[i][0], players[i][1], 100, players[i][2]));
//}


/*var inv_id = setInterval({}, 100);*/


// center 326 181
// 26 161
// -2635 104
// 227.5999984741211 161
// -930 107

// 201,6
// 1675

// 8.3085317460317460317460317460317

// 324 169.142

//0.10015820962204428972690806487505



// 502 - 168

////

// 274 380

//points.set('p1',new Point(50,50,12,'rgba(0,255,0,1)','rgba(0,0,0,0)'));

/*let k = setInterval(function(){
    for(let p of this.points.values()) {
        p.target(p.x+Math.random()*10,p.y+Math.random()*10);
    }
},100);
*/

p5.disableFriendlyErrors = true;

function setup() {
    let canvas = createCanvas(ui.cw, ui.ch);
    canvas.parent('sketch-holder');
    img = loadImage("img/"+ui.map.name+".png");

}


function draw() {
    img.resize(512, 512);
    image(img, 0, 0);
    if (ui.showtrail){
        for(let p of points.values()) {
            p.render_trail();
        }
    }
    for(let p of points.values()) {
        p.render();
    }
    for(let p of points.values()) {
        p.render_info();
    }
}


document.getElementById('map').onchange = function(){
    //document.getElementById('result').value = document.getElementById('map').value;
    ui.map = maps.get(document.getElementById('map').value);
    setup();
}
