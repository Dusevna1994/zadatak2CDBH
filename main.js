const fs = require('fs'); //file stream modul kako bi citao iz datoteka
const grupe = citajIzDatoteke('groups.json'); //citam podatke iz datoteke, mozda nisam morao globalno da smestam promenljivu..
grupnaFaza(); //poziv
eliminacionaFaza(sesir()); //poziv (kada se izvrsi sesir() (sesir vraca rezultate koji dalje idu u eliminacionaFaza())

function grupnaFaza(){
    //kreiranje objekta raspored u koji ce se smestiti rezultati utakmica po kolima i grupama
    let raspored = {"I kolo":{},"II kolo":{},"III kolo":{}};
    for(const grupa in grupe){
        const ekipe = grupe[grupa];         //izvlaci grupu 
        raspored["I kolo"]["Grupa "+grupa+":"] = [utakmica(ekipe[0],ekipe[1]),utakmica(ekipe[2],ekipe[3])]; //rezultati meceva se smestaju u niz po kolu i grupi
        raspored["II kolo"]["Grupa "+grupa+":"] = [utakmica(ekipe[2],ekipe[0]),utakmica(ekipe[1],ekipe[3])];
        raspored["III kolo"]["Grupa "+grupa+":"] = [utakmica(ekipe[1],ekipe[2]),utakmica(ekipe[3],ekipe[0])];
        grupe[grupa].sort(function(a,b){    //koristim priliku da sortiram grupu, posto su se prethodno odigrale utakmice, i tako automatski dobijem plasman 1-4 u grupi
            let rezultat = a.olimpijada.protivnici.find(x=>x['Opponent']===b['Team'])['Result'].split("-"); //ovde izvlacim rezultat iz medjusobnog duela. -Linija koda ispod: poredjenja po bodovima, ako imaju isti broj bodova, onda poredim pobednika iz medjusobnog duela, ako je i to ispalo jednako, onda kos razlika
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
    for(let grupa of Object.values(grupe)){
        for(let ekipa of grupa){
            redosledEkipa.push(ekipa); //sve ekipe na olimp. smestam u jedan niz koji cu potom da sortiram po odredjenim kriterijumima (kod ispod)
        }
    }
    redosledEkipa.sort(function(a,b){   //ekipe se sortiraju po bodovima, ako imaju iste bodove kos razlika, ako i taj podatak imaju isti onda po postignutim poenima, ako je i to slucajno jednako (0.1% sanse :D), onda se nista ne menja
        return a.olimpijada.bodovi>b.olimpijada.bodovi?-1:a.olimpijada.bodovi===b.olimpijada.bodovi?(a.olimpijada.kosRazlika>b.olimpijada.kosRazlika?-1:(a.olimpijada.kosRazlika===b.olimpijada.kosRazlika?(a.olimpijada.postignutiPoeni>=b.olimpijada.postignutiPoeni?-1:1):1)):1;
    });
    let d = redosledEkipa.slice(0,2); //izdvajam prve dve najbolje ekipe i smestam u sesir d, u nastavku isto tako za sve ostale sesire..
    let e = redosledEkipa.slice(2,4); //3 i 4 ekipa
    let f = redosledEkipa.slice(4,6); //5 i 6 ek.
    let g = redosledEkipa.slice(6,8); //7 i 8 ek.
    console.log("\nEliminaciona faza (šeširi):\nŠešir D:\n  "+d[0]['Team']+"\n  "+d[1]['Team']+"\nŠešir E:\n  "+e[0]['Team']+"\n  "+e[1]['Team']); //prikazujem sesire
    console.log("Šešir F:\n  "+f[0]['Team']+"\n  "+f[1]['Team']+"\nŠešir G:\n  "+g[0]['Team']+"\n  "+g[1]['Team']+"\n");
    return [d,e,f,g]; //ovi podaci idu u eliminacionu fazu..
}

function eliminacionaFaza([d,e,f,g]){ //uvrnut deo razbacan.. al' radi posao :D
    let elimfaza = {četvrtfinale:[],polufinale:[],"borba za treće mesto":[],finale:[]};
    //metoda niza .sort() sortira niz i vraca nazad, uz pomoc slucajnog broja, po sesiru, tako sto sam dao 50% sanse da bude na prvom mestu u nizu iz sesira ili na drugom mestu, potom .map() vraca konacno nazad u niz izmene..Da se ispostuje nasumicna selekcija ekipa..
    [d,e,f,g].map(x=>x.sort((a,b)=>Math.random()-0.5)); //najkraci put za tako nesto :)
    //CETVRT FINALE -> prethodno gde je metoda map i sort sam pomesao da bude nasumice odredjeno ko ce s'kim da igra, e sad proveravam da li su slucajno timovi prethodno igrali u grupnoj fazi, ako jesu igrace sa drugom ekipom iz sesira..
    let dg = !(d[0].olimpijada.protivnici.find(x=>x['Opponent']===g[0]['Team']))?(!(d[1].olimpijada.protivnici.find(x=>x['Opponent']===g[1]['Team']))?cfpf([[d[0],g[0]],[d[1],g[1]]],elimfaza['četvrtfinale']):cfpf([[d[0],g[1]],[d[1],g[0]]],elimfaza['četvrtfinale'])):((d[0].olimpijada.protivnici.find(x=>x['Opponent']===g[1]['Team']))?cfpf([[d[1],g[0]],[d[0],g[1]]],elimfaza['četvrtfinale']):cfpf([[d[0],g[1]],[d[1],g[0]]],elimfaza['četvrtfinale']));
    let ef = !(e[0].olimpijada.protivnici.find(x=>x['Opponent']===f[0]['Team']))?(!(e[1].olimpijada.protivnici.find(x=>x['Opponent']===f[1]['Team']))?cfpf([[e[0],f[0]],[e[1],f[1]]],elimfaza['četvrtfinale']):cfpf([[e[0],f[1]],[e[1],f[0]]],elimfaza['četvrtfinale'])):((e[0].olimpijada.protivnici.find(x=>x['Opponent']===f[1]['Team']))?cfpf([[e[1],f[0]],[e[0],f[1]]],elimfaza['četvrtfinale']):cfpf([[e[0],f[1]],[e[1],f[0]]],elimfaza['četvrtfinale']));
    //POLU FINALE
    dg.sort((a,b)=>Math.random()-0.5); ef.sort((a,b)=>Math.random()-0.5); //opet miksujem da bude nasumice 50% sanse za broj 0> ili <0.. 
    let finalisti = cfpf([[dg[0],ef[0]],[dg[1],ef[1]]],elimfaza['polufinale']); //odredio sam finaliste
    let [timB1,timB2] = [...dg,...ef].filter(tim2=>!finalisti.some(tim1=>tim1['Team']===tim2['Team'])); //izvlace se svi sto se ne podudaraju sa finalistima, tj. porazeni u polufinalu i oni se bore za 3. mesto, metodu niza .some() koristim jer za jedno podudaranje vraca true, za razliku od .every()
    let [timF1,timF2] = finalisti; //izdvajanje na pojedinacno iz niza (destrukturisanje)
    elimfaza["borba za treće mesto"].push(utakmica(timB1,timB2));
    let trece = pobednik(timB1,timB2);
    elimfaza['finale'].push(utakmica(timF1,timF2));
    let prvo = pobednik(timF1,timF2);
    let drugo = finalisti.find(tim=>prvo['Team']!==tim['Team']); //koristim find da prondaje porazenog iz finala, jer ce za razliku od .filter() koji vraca niz, ovaj vratiti doslovni obj.
    //prikazujem sad sve meceve koji su se odigrali u elminacionij fazi
    rezultati(elimfaza);
    //i konacno medalje :)
    console.log("\nMEDALJE\n1. mesto: "+prvo['Team']+" (zlato)"+"\n2. mesto: "+drugo['Team']+" (srebro)"+"\n3. mesto: "+trece['Team']+" (bronza)");
}
function cfpf(parovi,faza){ //cfpf predstavlja cetvrtfinale/polufinale, nisam imao ideju za bolji naziv :)
    let timovi = []; //ekipe koje idu dalje se smestaju u ovaj niz 
    for(let par of parovi){
        faza.push(utakmica(par[0],par[1])); //ovde se pokrece funkcija koja vraca rezultat koji se smesta u aktuelnu fazu, i azuriraju se timovi
        timovi.push(pobednik(par[0],par[1])); //funkcija koja vraca pobednika, odnosno ekipu sa boljim rezultatom u mecu
    }
    return timovi;  //vracam pobednike (u prom. lg ili dg sve zavisi iz koje linije je pozvana f-ja)
}
function pobednik(tim1,tim2){
    let protivnici = tim1.olimpijada.protivnici;  //-> odakle cu u ovoj liniji koda da izvucem rezultat posto je azurirana ekipa u poslednji niz svojstva protivnici..
    let rezultat = protivnici[protivnici.length-1]['Result'].split("-"); //razdvajam string dakle rezultat1 - rezultat2, rezultat 1 pripada prvoj ekipi iz koje izvlacim rezultat, drugi rez drugoj ekipi
    if(parseInt(rezultat[0])>parseInt(rezultat[1])){  //konverzija stringa u integer
        return tim1;    //ukoliko je prvi rezultat veci on pripada prvoj ekipi i to znaci da je pobedila ta ekipa i ide dalje
    }else{
        return tim2;    //u suprotnom znaci da je pobedila druga ekipa..
    }
}
function utakmica(e1,e2){
    let rez1 = svojstvaIRezultat(e1,e2['FIBARanking']); //koristim rank protivnika za kalkulaciju rezultata u utakmici, isto vazi za red ispod
    let rez2 = svojstvaIRezultat(e2,e1['FIBARanking']);
    azuriraj(e1.olimpijada,rez1,rez2,e2['Team']);   //azuriranje informacija nakon utakmice po ekipi (takodje za kod ispod duplirano :( )
    azuriraj(e2.olimpijada,rez2,rez1,e1['Team']);
    return e1['Team']+"-"+e2['Team']+" "+"["+rez1+":"+rez2+"]"; //vraca rezultat
}
function svojstvaIRezultat(e,rankProtivnika){
    let eLista;                 //ova citava funkcija :D, sluzi da ako ekipe nemaju informacije sa olimpijade bodove,rezultate itd., da ucita podatke sa pripremnih utakmica (najvaznije za I kolo grupne faze, posle totalno bespotrebno ali ce svakako prolaziti tu)
    if(e.olimpijada){
        eLista = e.olimpijada;
    }else{
        eLista = pripremneUtakmice(e['ISOCode']);
        e.olimpijada = olimpijada();
    }
    return Math.floor(randomBroj()*eLista.prosecanBrojPoena+(eLista.forma*rankProtivnika)); //e ovde se desava cudo :D u nazivu svojstava se moze primetiti sta se kalkulise 
}
function randomBroj(){
    let poeni;
    while((poeni=Math.random())<0.8);  //postavio sam ovde da broj moze biti izmedju 0.8 i 1, iz razloga sto izbacuje "najrealnije" rezultate, sa ovim proracunom koje sam napravio u svojstvaIRezultat() :D
    return poeni;                      
}
function azuriraj(t,postignutiPoeni,primljeniPoeni,protivnik){ //upisivanje informacija timovima nakon utakmice (rezultati,forma itd.)
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
    t.forma = parseFloat((t.pobede/(t.pobede+t.porazi)*1).toFixed(2));  //ovako mi palo napamet da racunam formu :D, nisam smislio nista bolje..
}
function rezultati(grupe){
    for(let grupa in grupe){
        console.log("  "+grupa);
        for(let rezultat of grupe[grupa]){
            console.log("\t"+rezultat);
        }
    }
}
function pripremneUtakmice(tim){ //ova funkcija sluzi da procita podatke u pripremnim utakmicama po ekipi koja se prosledi f-ji, sluzice mi informacije iz priprema za I kolo, kada pocinju olimpijske igre
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
function olimpijada(){ //"kostur" koji se dodeljuje svakom ekipi
    return {bodovi:0,pobede:0,porazi:0,postignutiPoeni:0,primljeniPoeni:0,prosecanBrojPoena:0.0,kosRazlika:0,protivnici:[],forma:0};
}
function citajIzDatoteke(putanja){ //cita iz datoteka koje ste prilozili .json i konvertuje u js obj.
    return JSON.parse(fs.readFileSync(putanja,'utf-8'));
}


