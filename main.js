const fs = require('fs');
let grupe = citajIzDatoteke('groups.json');
grupnaFaza();
let [d,e,f,g] = sesir();  
eliminacionaFaza(d,e,f,g);

function grupnaFaza(){
    //kreiranje objekta raspored u koji ce se smestiti rezultati utakmica po kolima i grupama
    let raspored = {"I kolo":{},"II kolo":{},"III kolo":{}};
    for(const grupa in grupe){
        const ekipe = grupe[grupa];
        raspored["I kolo"]["Grupa "+grupa+":"] = [utakmica(ekipe[0],ekipe[1]),utakmica(ekipe[2],ekipe[3])];
        raspored["II kolo"]["Grupa "+grupa+":"] = [utakmica(ekipe[2],ekipe[0]),utakmica(ekipe[1],ekipe[3])];
        raspored["III kolo"]["Grupa "+grupa+":"] = [utakmica(ekipe[1],ekipe[2]),utakmica(ekipe[3],ekipe[0])];
        grupe[grupa].sort(function(a,b){
            let rezultat = a.olimpijada.protivnici.find(x=>x['Opponent']===b['Team'])['Result'].split("-");
            return a.olimpijada.bodovi>b.olimpijada.bodovi?-1:a.olimpijada.bodovi===b.olimpijada.bodovi?(parseInt(rezultat[0])>parseInt(rezultat[1])?-1:(parseInt(rezultat[0])===parseInt(rezultat[1])?(a.olimpijada.kosRazlika>=b.olimpijada.kosRazlika?-1:1):1)):1;
        });
    }
    //prikazivanje rezultata po kolima i grupama
    for(let kolo in raspored){  
        console.log(kolo);
        rezultati(raspored[kolo]);
    }
    //ispisivanje tabele, konacni rezultati i rangiranje po grupama
    let tekst = "\n\t\tTABELA:\n\t\t-------\n  poz/ekipa (iso)/bodovi/pobede/porazi/postignuti poeni/primljeni poeni/koš razlika";
    console.log(tekst);
    for(let grupa in grupe){
        console.log("Grupa: "+grupa+":");
        for(let i=0;i<grupe[grupa].length;i++){
            let tim = grupe[grupa][i];
            console.log(" "+(i+1)+": "+tim['Team']+"("+tim['ISOCode']+")"+" "+tim['olimpijada']['bodovi']+" "+tim['olimpijada']['pobede']+" "+tim['olimpijada']['porazi']+" "+tim['olimpijada']['postignutiPoeni']+" "+tim['olimpijada']['primljeniPoeni']+" "+tim['olimpijada']['kosRazlika']);
        }
    }
}

function sesir(){
    let redosledEkipa = [];
    for(let grupa of Object.values(grupe))
        for(let ekipa of grupa)
            redosledEkipa.push(ekipa);
    
    redosledEkipa.sort(function(a,b){
        return a.olimpijada.bodovi>b.olimpijada.bodovi?-1:a.olimpijada.bodovi===b.olimpijada.bodovi?(a.olimpijada.kosRazlika>b.olimpijada.kosRazlika?-1:(a.olimpijada.kosRazlika===b.olimpijada.kosRazlika?(a.olimpijada.postignutiPoeni>=b.olimpijada.postignutiPoeni?-1:1):1)):1;
    });
    let d = redosledEkipa.slice(0,2);
    let e = redosledEkipa.slice(2,4);
    let f = redosledEkipa.slice(4,6);
    let g = redosledEkipa.slice(6,8);
    console.log("\nEliminaciona faza (šeširi):\nŠešir D:\n  "+d[0]['Team']+"\n  "+d[1]['Team']+"\nŠešir E:\n  "+e[0]['Team']+"\n  "+e[1]['Team']);
    console.log("Šešir F:\n  "+f[0]['Team']+"\n  "+f[1]['Team']+"\nŠešir G:\n  "+g[0]['Team']+"\n  "+g[1]['Team']);
    return [d,e,f,g];
}

function utakmica(e1,e2){
    let rez1 = svojstvaIRezultat(e1,e2['FIBARanking']);
    let rez2 = svojstvaIRezultat(e2,e1['FIBARanking']);
    azuriraj(e1.olimpijada,rez1,rez2,e2['Team']);
    azuriraj(e2.olimpijada,rez2,rez1,e1['Team']);
    return e1['Team']+"-"+e2['Team']+" "+"["+rez1+":"+rez2+"]";
}
function svojstvaIRezultat(e,rankProtivnika){
    let eLista;
    if(e.olimpijada){
        eLista = e.olimpijada;
    }else{
        eLista = pripremneUtakmice(e['ISOCode']);
        e.olimpijada = olimpijada();
    }
    return Math.floor(randomBroj()*eLista.prosecanBrojPoena+(eLista.forma*rankProtivnika));
}
function randomBroj(){
    let poeni;
    while((poeni=Math.random())<0.8);  //postavio sam ovde da broj moze biti izmedju 0.8 i 1, iz razloga sto izbacuje "najrealnije" rezultate, sa ovim proracunom koje sam napravio u svojstvaIRezultat() :D
    return poeni;                       //0.8+0.1 kad budem odredjivao zreb
}
function azuriraj(t,postignutiPoeni,primljeniPoeni,protivnik){
    if(postignutiPoeni>primljeniPoeni){  //ukoliko je pobedila prva ekipa 
        t.bodovi+=2;    //2 boda za pobedu prvoj ekipi
        t.pobede++;     //dodaje se broj pobeda
    }else{
        t.bodovi+=1;    //1 bod za poraz
        t.porazi++;     //dodaje se broj poraza
    }
    t.postignutiPoeni+=postignutiPoeni;    //ostala svojstva..
    t.primljeniPoeni+=primljeniPoeni;
    t.prosecanBrojPoena=parseFloat((t.postignutiPoeni/(t.pobede+t.porazi)).toFixed(2));
    t.kosRazlika = t.postignutiPoeni-t.primljeniPoeni;
    t.protivnici.push({Opponent:protivnik,Result:postignutiPoeni+"-"+primljeniPoeni});
    t.forma = parseFloat((t.pobede/(t.pobede+t.porazi)*1).toFixed(2));
}
function rezultati(grupe){
    for(let grupa in grupe){
        console.log("  "+grupa);
        for(let rezultat of grupe[grupa]){
            console.log("\t"+rezultat);
        }
    }
}
function pripremneUtakmice(tim){
    const pripremneUtakmice = citajIzDatoteke('exibitions.json'); //cita se fajl i dodeljuje se promenljivoj
    let pobede = 0,postignutiPoeni = 0;
    for(let mec of pripremneUtakmice[tim]){                   //da bi se procitala tacna reprezentacija koja se trazi, dodeljuje se ISOCode (tim) i prolazi se kroz sva svojstva koja poseduje trazena reprezentacija
        let post = parseInt(mec['Result'].split("-")[0]);
        let prim = parseInt(mec['Result'].split("-")[1]);
        postignutiPoeni+=post;  //razdvajanje string rezultata i konvertovanje u broj
        if(post>prim){
            pobede++;
        }
    }                          //vraca sva svojstva 
    return {prosecanBrojPoena: parseFloat((postignutiPoeni/2).toFixed(2)),forma: parseFloat((pobede/2*1).toFixed(2))};
}
function olimpijada(){
    return {bodovi:0,pobede:0,porazi:0,postignutiPoeni:0,primljeniPoeni:0,prosecanBrojPoena:0.0,kosRazlika:0,protivnici:[],forma:0};
}
function citajIzDatoteke(putanja){
    return JSON.parse(fs.readFileSync(putanja,'utf-8'));
}


