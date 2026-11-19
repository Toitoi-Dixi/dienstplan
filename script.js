const supabaseUrl =
    "https://wosxlwsnkssergfvbzla.supabase.co";

const supabaseKey =
    "sb_publishable_6tO_oqxyRqx241aeypFqTw_JArFTo3-";

const supabaseClient =
    supabase.createClient(
        supabaseUrl,
        supabaseKey
    );
let aktuellerFahrer = "";
let aktuellesDatum = "";

/* ==========================
   STAMMDATEN
========================== */

let fahrerStammdaten = [];
let fahrzeugStammdaten = [];
let wochenmatrix = [];
let abwesenheitsarten = [];

let plan = {};

/* ==========================
   HILFSFUNKTIONEN
========================== */

function getKey(fahrerName, datum) {
    return fahrerName + "_" + datum;
}

function findeStammdaten(name)
{
    return fahrerStammdaten.find(function (f) {
        return f.name === name;
    });
}
function istAbwesenheit(art) {

    return abwesenheitsarten.some(
        a =>
            a.bezeichnung === art
    );

}
function zeigeMeldung(text) {

    const meldung =
        document.getElementById(
            "meldung"
        );

    meldung.textContent =
        text;

    meldung.style.display =
        "block";

    setTimeout(() => {

        meldung.style.display =
            "none";

    }, 3000);
}
/* ==========================
   FAHRER
========================== */
function fahrerHinzufuegen() {

    document.getElementById(
        "fahrerNeuOverlay"
    ).style.display = "flex";

}
function schliesseNeuenFahrer() {

    document.getElementById(
        "fahrerNeuOverlay"
    ).style.display = "none";

}
async function fahrerSpeichern() {

    const familienname =
        document.getElementById(
            "neuFamilienname"
        ).value.trim();

    const vorname =
        document.getElementById(
            "neuVorname"
        ).value.trim();

    const chip =
        document.getElementById(
            "neuChip"
        ).value.trim();

    if (
        !familienname ||
        !vorname ||
        !chip
    ) {

        zeigeMeldung(
            "⚠️ Alle Felder ausfüllen"
        );

        return;
    }

    const chipVorhanden =
        fahrerStammdaten.find(
            f => f.chip === chip
        );

    if (chipVorhanden) {

        zeigeMeldung(
            "❌ Chipnummer bereits vergeben"
        );

        return;
    }

    const fahrerVorhanden =
        fahrerStammdaten.find(
            f =>
                f.vorname?.toLowerCase() ===
                    vorname.toLowerCase()
                &&
                f.familienname?.toLowerCase() ===
                    familienname.toLowerCase()
        );

    if (fahrerVorhanden) {

        zeigeMeldung(
            "❌ Fahrer existiert bereits"
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("Fahrer_Stammdaten")
            .insert([
                {
                    familienname:
                        familienname,

                    vorname:
                        vorname,

                    chip:
                        chip,

                    status:
                        "Aktiv"
                }
            ]);

    if (error) {

        console.log(error);

        zeigeMeldung(
            "❌ Fehler beim Speichern"
        );

        return;
    }

    document.getElementById(
        "neuFamilienname"
    ).value = "";

    document.getElementById(
        "neuVorname"
    ).value = "";

    document.getElementById(
        "neuChip"
    ).value = "";

    schliesseNeuenFahrer();

    zeigeMeldung(
        "✅ Fahrer gespeichert"
    );

    ladeFahrer();
}

    document.getElementById(
        "fahrerNeuOverlay"
    ).style.display = "none";



async function fahrerInaktivSetzen() {

    const name =
        prompt("Fahrername:");

    if (!name) return;

    const { error } =
        await supabaseClient
            .from("Fahrer_Stammdaten")
            .update({
                status: "Inaktiv"
            })
            .eq(
                "familienname",
                name
            );

    if (error) {

        console.log(error);
       zeigeMeldung(
    "❌ Fehler"
);
        return;
    }

    ladeFahrer();
   
}
function fahrerInfo() {

    const select =
        document.getElementById(
            "fahrerInfoSelect"
        );

    select.innerHTML = "";
    
const leerOption =
    document.createElement(
        "option"
    );

leerOption.value = "";

leerOption.textContent =
    "Bitte Fahrer auswählen";

select.appendChild(
    leerOption
);
    fahrerStammdaten.forEach(
        fahrer => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                fahrer.familienname;

            option.textContent =
                fahrer.name;

            select.appendChild(
                option
            );

        }
    );


document.getElementById(
    "fahrerInfoOverlay"
).style.display = "flex";}
document.getElementById(
    "fahrerInfoDaten"
).innerHTML = "";
function aktualisiereFahrerInfo() {

    const familienname =
        document.getElementById(
            "fahrerInfoSelect"
        ).value;

    const fahrer =
        fahrerStammdaten.find(
            f =>
                f.familienname === familienname
        );

    if (!fahrer) return;

document.getElementById(
    "fahrerInfoDaten"
).innerHTML =

    "<b>Vorname:</b> " +
    (fahrer.vorname || "") +

    "<br><br><b>Nachname:</b> " +
    (fahrer.familienname || "") +

    "<br><br><b>Chip:</b> " +
    (fahrer.chip || "") +

    "<br><br><b>Telefon privat:</b> " +
    (fahrer.telefon_privat || "-") +

    "<br><br><b>Telefon dienstlich:</b> " +
    (fahrer.telefon_dienstlich || "-") +

    "<br><br><b>E-Mail:</b> " +
    (fahrer.email || "-") +

    "<br><br><b>Adresse:</b> " +
    (fahrer.adresse || "-") +

    "<br><br><b>PLZ:</b> " +
    (fahrer.plz || "-") +

    "<br><br><b>Ort:</b> " +
    (fahrer.ort || "-") +

    "<br><br><b>Qualifikationen:</b> " +
    (fahrer.qualifikationen || "-") +

    "<br><br><b>Status:</b> " +
    (fahrer.status || "-");
}
function schliesseFahrerInfo() {

    document.getElementById(
        "fahrerInfoOverlay"
    ).style.display = "none";

}
/* ==========================
   MODAL
========================== */

function artGeaendert() {

    const art =
        document.getElementById("artInput").value;

    const block =
        document.getElementById("dienstBlock");
if (
    istAbwesenheit(art)
)
   {
        block.style.display = "none";
    }
    else {
        block.style.display = "block";
    }
}

function zelleBearbeiten(name, datum) {

    aktuellerFahrer = name;
    aktuellesDatum = datum;

    const k = getKey(name, datum);

    const stamm =
        findeStammdaten(name);

    const wochentag =
        [
            "Sonntag",
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag"
        ][new Date(datum).getDay()];

    if (!plan[k]) {

        const eintrag =
            wochenmatrix.find(
                w =>
                    w.fahrer === name &&
                    w.wochentag === wochentag
            );

        plan[k] = {
            art: "Dienst",
            dienst: eintrag?.dienst || "",
            fahrzeug: eintrag?.fahrzeug || ""
        };
    }

    document.getElementById("artInput").value =
        plan[k].art || "Dienst";

    document.getElementById("dienstInput").value =
        plan[k].dienst || "";

    document.getElementById("fahrzeugInput").value =
        plan[k].fahrzeug || "";



    artGeaendert();

    document.getElementById(
        "modalOverlay"
    ).style.display = "flex";
}

function schliessenModal() {

    document.getElementById(
        "modalOverlay"
    ).style.display = "none";
}

function speichernZelle() {

    const art =
        document.getElementById(
            "artInput"
        ).value;

    const dienst =
        document.getElementById(
            "dienstInput"
        ).value;

    const fahrzeug =
    document.getElementById(
        "fahrzeugInput"
    ).value;

    const key =
        getKey(
            aktuellerFahrer,
            aktuellesDatum
        );
    const alterEintrag =
    plan[key];
     plan[key] = {
    art: art,
    dienst:
        dienst ||
        alterEintrag?.dienst ||
        "",
    fahrzeug:
        fahrzeug ||
        alterEintrag?.fahrzeug ||
        ""
}; 

    schliessenModal();

    ladePlan();
}

/* ==========================
   OFFENE DIENSTE
========================== */

function offeneDiensteErmitteln() {

    const liste = [];

    for (const key in plan) {

        const eintrag = plan[key];

          const fahrerName =
                key.split("_")[0];

            const datum =
                key.split("_")[1];


let dienstName = eintrag?.dienst;
    if (!dienstName) {

    const datumObj =
        new Date(datum);

    const wochentag =
        [
            "Sonntag",
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag"
        ][datumObj.getDay()];

    const wmEintrag =
        wochenmatrix.find(
            w =>
                w.fahrer === fahrerName &&
                w.wochentag === wochentag
        );

    dienstName =
        wmEintrag?.dienst || "";
}    
        if (
            eintrag.art === "Urlaub" ||
            eintrag.art === "Frei" ||
            eintrag.art === "Krank" ||
            eintrag.art === "Todesfall" ||
            eintrag.art === "Zeitausgleich"
        ) {

          

            const stamm =
                findeStammdaten(
                    fahrerName
                );

if (stamm) {
    liste.push({
        datum: datum,
        dienst: dienstName
    });
}}}
    return liste;
}

function offeneDiensteAnzeigen() {

    const container =
        document.getElementById(
            "offeneDienste"
        );

    if (!container) return;

    container.innerHTML = "";

    const liste =
        offeneDiensteErmitteln();

    for (let i = 0; i < liste.length; i++) {

        const datumObj =
            new Date(
                liste[i].datum
            );

        const datumText =
            datumObj.toLocaleDateString(
                "de-DE"
            );

        container.innerHTML +=
            "<div class='offen'>" +
            datumText +
            "<br>" +
            liste[i].dienst +
            "</div>";
    }
}

/* ==========================
   MATRIX
========================== */

function ladePlan() {

    const von =
    new Date(
        document.getElementById("von").value + "T00:00:00"
    );

const bis =
    new Date(
        document.getElementById("bis").value + "T23:59:59"
    );

if (isNaN(von) || isNaN(bis))
        return;

    const tage = [];

    const d =
        new Date(von);

    while (d <= bis) {

        tage.push(
            new Date(d)
        );

        d.setDate(
            d.getDate() + 1
        );
    }

    const thead =
        document.getElementById("thead");

    const tbody =
        document.getElementById("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    let header =
        "<tr><th class='fahrerkopf'>Fahrer</th>";

    for (let i = 0; i < tage.length; i++) {

        const tag =
            tage[i];

        const wd =
            tag.toLocaleDateString(
                "de-DE",
                { weekday: "short" }
            );

        let headerKlasse = "";

        if (tag.getDay() === 6) {
            headerKlasse = "samstag";
        }

        if (tag.getDay() === 0) {
            headerKlasse = "sonntag";
        }

        header +=
            "<th class='" +
            headerKlasse +
            "'>" +
            wd +
            "<br>" +
            tag.getDate() +
            "</th>";
    }

    header += "</tr>";

    thead.innerHTML = header;

    for (let f = 0; f < fahrerStammdaten.length; f++) {

        const fahrer =
            fahrerStammdaten[f];

       let row =
    "<tr>" +
    "<td class='fahrer'>" +

    "<div class='fahrername'>" +
    fahrer.name +
    "</div>" +

    "<div class='fahrerchip'>" +
    fahrer.chip +
    "</div>" +

    "</td>";


        for (let t = 0; t < tage.length; t++) {

            const tag =
                tage[t];
const datum =
    tag.getFullYear() +
    "-" +
    String(tag.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(tag.getDate()).padStart(2, "0");
   

            let daten =
                plan[
                    getKey(
                        fahrer.name,
                        datum
                    )
                ];

          if (!daten) {

    const wochentag =
        [
            "Sonntag",
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag"
        ][tag.getDay()];

    const eintrag =
        wochenmatrix.find(
            w =>
                w.fahrer === fahrer.name &&
                w.wochentag === wochentag
        );

    daten = {
        art: "Dienst",
        dienst: eintrag?.dienst || "",
        fahrzeug: eintrag?.fahrzeug || ""
    };
}

            let text1 = "";
            let text2 = "";
            let klasse = "";

            if (daten.art === "Urlaub") {

                text1 = "Urlaub";
                klasse = "urlaub";

            } else if (daten.art === "Krank") {

                text1 = "Krank";
                klasse = "krank";

            } else if (daten.art === "Zeitausgleich") {

                text1 = "ZA";
                klasse = "za";

            } else if (daten.art === "Frei") {

                text1 = "Frei";
                klasse = "frei";

            } else {

                text1 = daten.dienst;
                text2 = daten.fahrzeug;
            }

            let tagesKlasse = "";

            if (tag.getDay() === 6) {
                tagesKlasse = "samstag";
            }

            if (tag.getDay() === 0) {
                tagesKlasse = "sonntag";
            }

            row +=
                "<td class='zelle " +
                klasse +
                " " +
                tagesKlasse +
                "' onclick=\"zelleBearbeiten('" +
                fahrer.name +
                "','" +
                datum +
                "')\">" +

                "<div class='dienst'>" +
                text1 +
                "</div>" +

                "<div class='fahrzeug'>" +
                text2 +
                "</div>" +

                "</td>";
        }

        row += "</tr>";

        tbody.innerHTML += row;
    }

    offeneDiensteAnzeigen();
}

/* ==========================
   START
========================== */

window.onload = function () {

const heute = new Date();

const vonDatum =
    heute.getFullYear() +
    "-" +
    String(heute.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(heute.getDate()).padStart(2, "0");

document.getElementById("von").value =
    vonDatum;
const bis = new Date();
bis.setDate(bis.getDate() + 14);

const bisDatum =
    bis.getFullYear() +
    "-" +
    String(bis.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(bis.getDate()).padStart(2, "0");

document.getElementById("bis").value =
    bisDatum;
  ladeAbwesenheitsarten();
ladeDienste();
ladeFahrzeuge();
ladeWochenmatrix();
ladeFahrer();
 
};
async function ladeWochenmatrix() {

    const { data, error } =
        await supabaseClient
            .from("Wochenmatrix")
            .select("*");

    wochenmatrix = data;
    ladePlan();

    if (error) {

        console.log(error);
        return;
    }

}

async function ladeFahrer() {

   const { data, error } =
    await supabaseClient
        .from("Fahrer_Stammdaten")
        .select("*")
        .eq("status", "Aktiv");
 if (error) {

        console.log(error);
        return;
    }

fahrerStammdaten = data.map(
    fahrer => ({

        name:
            fahrer.vorname +
            " " +
            fahrer.familienname,

        vorname:
            fahrer.vorname,

        familienname:
            fahrer.familienname,

        chip:
            fahrer.chip,
        
        telefon_privat:
            fahrer.telefon_privat,

        telefon_dienstlich:
            fahrer.telefon_dienstlich,

        email:
            fahrer.email,

        adresse:
            fahrer.adresse,

        plz:
            fahrer.plz,

        ort:
            fahrer.ort,

        qualifikationen:
            fahrer.qualifikationen,

        status:
            fahrer.status

    })
);
 ladePlan();
}

async function ladeAbwesenheitsarten() {

    const artSelect =
        document.getElementById(
            "artInput"
        );

    artSelect.innerHTML = "";

    const { data, error } =
        await supabaseClient
            .from("Abwesenheitsarten")
            .select("*");

    if (error) {

        console.log(error);
        return;

    }
abwesenheitsarten = data;
    data.forEach(art => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            art.bezeichnung;

        option.textContent =
            art.bezeichnung;

        artSelect.appendChild(
            option
        );

    });
}
async function ladeDienste() {

    const dienstSelect =
        document.getElementById(
            "dienstInput"
        );

    dienstSelect.innerHTML = "";

    const { data, error } =
        await supabaseClient
            .from("Dienste")
            .select("*")
            .order("bezeichnung");

    if (error) {

        console.log(error);
        return;
    }

    data.forEach(dienst => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            dienst.bezeichnung;

        option.textContent =
            dienst.bezeichnung;

        dienstSelect.appendChild(
            option
        );

    });
}
async function ladeFahrzeuge() {

    const result =
        await supabaseClient
            .from("Fahrzeug_Stammdaten")
            .select("*");
 fahrzeugStammdaten = result.data;
const fahrzeugSelect =
    document.getElementById(
        "fahrzeugInput"
    );
fahrzeugSelect.innerHTML = "";
fahrzeugStammdaten.forEach(
    fahrzeug => {

     const option =
            document.createElement(
                "option"
            );

        option.value =
            fahrzeug.interne_ID;

        option.textContent =
            fahrzeug.interne_ID;

        fahrzeugSelect.appendChild(
            option
        );

    }
);
}
function fahrzeugAnlegen() {

    document.getElementById(
        "fahrzeugNeuOverlay"
    ).style.display = "flex";

}
function schliesseNeuesFahrzeug() {

    document.getElementById(
        "fahrzeugNeuOverlay"
    ).style.display = "none";

}
async function fahrzeugSpeichern() {

    const kennzeichen =
        document.getElementById(
            "neuKennzeichen"
        ).value.trim();

    const fahrzeugnummer =
        document.getElementById(
            "neuFahrzeugnummer"
        ).value.trim();

    const kategorie =
        document.getElementById(
            "neuKategorie"
        ).value.trim();

if (
    !kennzeichen ||
    !fahrzeugnummer ||
    !kategorie
) {

    zeigeMeldung(
        "⚠️ Alle Felder ausfüllen"
    );

    return;
}

const { error } =
    await supabaseClient
        .from("Fahrzeug_Stammdaten")
        .insert([
            {
                kennzeichen:
                    kennzeichen,

                interne_ID:
                    fahrzeugnummer,

                kategorie:
                    kategorie,

                status:
                    "Aktiv"
            }
        ]);

if (error) {

    console.log(error);

    zeigeMeldung(
        "❌ Fehler beim Speichern"
    );

    return;
}
 zeigeMeldung(
        "✅ Fahrzeug gespeichert"
    );

    document.getElementById(
        "neuKennzeichen"
    ).value = "";

    document.getElementById(
        "neuFahrzeugnummer"
    ).value = "";

    document.getElementById(
        "neuKategorie"
    ).value = "";

    schliesseNeuesFahrzeug();

}

async function fahrzeugStatusAendern() {
    await ladeFahrzeuge();
   
const select =
    document.getElementById(
        "fahrzeugStatusSelect"
    );

select.innerHTML = "";
    console.log(fahrzeugStammdaten);

    fahrzeugStammdaten.forEach(
    fahrzeug => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            fahrzeug.interne_ID;

        option.text =
            fahrzeug.kennzeichen +
            " - " +
            fahrzeug.interne_ID;

        select.appendChild(
            option
        );

    }
);
    document.getElementById(
        "fahrzeugStatusOverlay"
    ).style.display = "flex";

}
function schliesseFahrzeugStatus() {

    document.getElementById(
        "fahrzeugStatusOverlay"
    ).style.display = "none";

}
async function fahrzeugStatusSpeichern() {

    const fahrzeugID =
        document.getElementById(
            "fahrzeugStatusSelect"
        ).value;

    const neuerStatus =
        document.getElementById(
            "fahrzeugStatusNeu"
        ).value;

    const { error } =
        await supabaseClient
            .from("Fahrzeug_Stammdaten")
            .update({
                status: neuerStatus
            })
            .eq(
                "interne_ID",
                fahrzeugID
            );

    if (error) {

        console.log(error);

        zeigeMeldung(
            "❌ Fehler"
        );

        return;
    }

    await ladeFahrzeuge();

    zeigeMeldung(
        "✅ Status geändert"
    );

    schliesseFahrzeugStatus();

}
function dienstAnlegen() {
    zeigeMeldung("Dienst anlegen folgt");
}

function dienstLoeschen() {
    zeigeMeldung("Dienst löschen folgt");
}

function fahrzeugLoeschen() {
    zeigeMeldung("Fahrzeug löschen folgt");
}
