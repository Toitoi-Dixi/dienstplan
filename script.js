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
let alleFahrer = [];
let fahrerStammdaten = [];
let fahrzeugStammdaten = [];
let wochenmatrix = [];
let abwesenheitsarten = [];
let plan = {};
let konfliktCallback = null;
let dienste = [];

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
function findeDienstKonflikt(
    dienst,
    datum,
    aktuellerFahrer
) {

    for (const key in plan) {

        const eintrag =
            plan[key];

        const fahrer =
            key.split("_")[0];

        const planDatum =
            key.split("_")[1];

        if (
            fahrer !== aktuellerFahrer &&
            planDatum === datum &&
            eintrag.art === "Dienst" &&
            eintrag.dienst === dienst
        ) {

            return fahrer;

        }

    }

    return null;

}
function istDienstVerplant(
    dienst,
    datum
) {

    for (const key in plan) {

        const eintrag =
            plan[key];

        const planDatum =
            key.split("_")[1];

        if (
            planDatum === datum &&
            eintrag.art === "Dienst" &&
            eintrag.dienst === dienst
        ) {

            return true;

        }

    }

    return false;

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
function zeigeKonflikt(
    text,
    callback
) {

    konfliktCallback =
        callback;

    document.getElementById(
        "konfliktText"
    ).innerHTML = text;

    document.getElementById(
        "konfliktOverlay"
    ).style.display = "flex";

}

function konfliktFortfahren() {
console.log(
    "FORTFAHREN"
);
    document.getElementById(
        "konfliktOverlay"
    ).style.display = "none";

    if (konfliktCallback) {

        konfliktCallback();

    }

}

function konfliktAbbrechen() {

    document.getElementById(
        "konfliktOverlay"
    ).style.display = "none";

    konfliktCallback = null;

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

function fahrerStatusAendern() {

    const select =
        document.getElementById(
            "fahrerStatusSelect"
        );

    select.innerHTML = "";
    alleFahrer.forEach(
        fahrer => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                fahrer.familienname;

            option.textContent =
    fahrer.vorname +
    " " +
    fahrer.familienname;

            select.appendChild(
                option
            );

        }
    );

    document.getElementById(
        "fahrerStatusOverlay"
    ).style.display = "flex";

}
function schliesseFahrerStatus() {

    document.getElementById(
        "fahrerStatusOverlay"
    ).style.display = "none";

}
async function fahrerStatusSpeichern() {

    const fahrerName =
        document.getElementById(
            "fahrerStatusSelect"
        ).value;

    const neuerStatus =
        document.getElementById(
            "fahrerStatusNeu"
        ).value;
    const statusDatum =
        document.getElementById(
            "fahrerStatusDatum").value;

    const { error } =
        await supabaseClient
            .from("Fahrer_Stammdaten")
            .update({

    status: neuerStatus,

    aktiv_ab:
        neuerStatus === "Aktiv"
            ? statusDatum
            : null,

    inaktiv_ab:
        neuerStatus === "Inaktiv"
            ? statusDatum
            : null

})
            .eq(
                "familienname",
                fahrerName
            );

    if (error) {

        console.log(error);

        zeigeMeldung(
            "❌ Fehler"
        );

        return;

    }

    await ladeFahrer();
await ladeAlleFahrer();
    zeigeMeldung(
        "✅ Status geändert"
    );

    schliesseFahrerStatus();

}

function fahrerInfo() {

    const select =
        document.getElementById(
            "fahrerInfoSelect"
        );

    select.innerHTML = "";
    document.getElementById(
    "fahrerInfoDaten"
).innerHTML = "";
    
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
).style.display = "flex";
}

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

    document.getElementById(
        "fahrerInfoDaten"
    ).innerHTML = "";

}
function fahrzeugInfo() {

    const select =
        document.getElementById(
            "fahrzeugInfoSelect"
        );

    select.innerHTML = "";

    const leerOption =
        document.createElement(
            "option"
        );

    leerOption.value = "";

    leerOption.textContent =
        "Bitte Fahrzeug auswählen";

    select.appendChild(
        leerOption
    );

    fahrzeugStammdaten.forEach(
        fahrzeug => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                fahrzeug.interne_ID;

            option.textContent =
                fahrzeug.kennzeichen +
                " - " +
                fahrzeug.interne_ID;

            select.appendChild(
                option
            );

        }
    );

    document.getElementById(
        "fahrzeugInfoDaten"
    ).innerHTML = "";

    document.getElementById(
        "fahrzeugInfoOverlay"
    ).style.display = "flex";

}
function aktualisiereFahrzeugInfo() {

    const fahrzeugID =
        document.getElementById(
            "fahrzeugInfoSelect"
        ).value;

    const fahrzeug =
        fahrzeugStammdaten.find(
            f =>
                String(
                    f.interne_ID
                ) === fahrzeugID
        );

    if (!fahrzeug) return;

    document.getElementById(
        "fahrzeugInfoDaten"
    ).innerHTML =

        "<b>Kennzeichen:</b> " +
        (fahrzeug.kennzeichen || "") +

        "<br><br><b>Interne ID:</b> " +
        (fahrzeug.interne_ID || "") +

        "<br><br><b>Kategorie:</b> " +
        (fahrzeug.kategorie || "") +

        "<br><br><b>Sitzplätze:</b> " +
        (fahrzeug.sitzplaetze || "-") +

        "<br><br><b>Ladeplätze:</b> " +
        (fahrzeug.ladeplaetze || "-") +
       
        "<br><br><b>Standort:</b> " +
        (fahrzeug.standort || "-") +

        "<br><br><b>Anhängerkupplung:</b> " +
        (
            fahrzeug.anhaengerkupplung
                ? "Ja"
                : "Nein"
        ) +

        "<br><br><b>Status:</b> " +
        (fahrzeug.status || "-");

}
function schliesseFahrzeugInfo() {
      document.getElementById(
            "fahrerInfoSelect"
        ).value;


    document.getElementById(
        "fahrzeugInfoOverlay"
    ).style.display = "none";

    document.getElementById(
        "fahrzeugInfoDaten"
    ).innerHTML = "";

}
document.getElementById(
    "fahrzeugInfoSelect"
).value = "";

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

async function zelleBearbeiten(name, datum) {

    aktuellerFahrer = name;
    aktuellesDatum = datum;
await ladeDienste();
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
async function speicherePlanEintrag(
    key,
    art,
    dienst,
    fahrzeug,
    alterEintrag
) {

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

    const { error } =
        await supabaseClient
            .from("Planung")
            .upsert([
                {
                    fahrer:
                        aktuellerFahrer,

                    datum:
                        aktuellesDatum,

                    art:
                        art,

                    dienst:
                        dienst,

                    fahrzeug:
                        fahrzeug
                }
            ]);

    if (error) {

        console.log(error);

        zeigeMeldung(
            "❌ Fehler beim Speichern"
        );

        return;

    }

    schliessenModal();

    ladePlan();

}
async function speichernZelle() {

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
        getKey(aktuellerFahrer, aktuellesDatum
        );
    const alterEintrag =
    plan[key];
if (
    art === "Dienst" &&
    dienst
) {

    const konflikt =
        findeDienstKonflikt(
            dienst,
            aktuellesDatum,
            aktuellerFahrer
        );

    if (konflikt) {

        zeigeKonflikt(
            "Dienst bereits verplant bei:<br><br>" +
            konflikt,
            async function () {

                await speicherePlanEintrag(
                    key,
                    art,
                    dienst,
                    fahrzeug,
                    alterEintrag
                );

            }
        );

        return;

    }

}

await speicherePlanEintrag(
    key,
    art,
    dienst,
    fahrzeug,
    alterEintrag
);
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

        let dienstName =
            eintrag?.dienst;

        if (!dienstName) {

            dienstName =
                wmEintrag?.dienst || "";

        }

      if (
    istAbwesenheit(
        eintrag.art
    )
) {

    if (
        wmEintrag?.dienst &&
        !istDienstVerplant(
            wmEintrag.dienst,
            datum
        )
    ) {

        liste.push({
            datum: datum,
            dienst: wmEintrag.dienst
        });

    }

    if (
        eintrag.dienst &&
        eintrag.dienst !== wmEintrag?.dienst &&
        !istDienstVerplant(
            eintrag.dienst,
            datum
        )
    ) {

        liste.push({
            datum: datum,
            dienst: eintrag.dienst
        });

    }

}
          
        else if (
            eintrag.art === "Dienst" &&
            wmEintrag &&
            wmEintrag.dienst !== eintrag.dienst
        ) {

            liste.push({
                datum: datum,
                dienst: wmEintrag.dienst
            });

        }

    }

const eindeutig = [];

liste.forEach(eintrag => {

    const vorhanden =
        eindeutig.find(
            e =>
                e.datum === eintrag.datum &&
                e.dienst === eintrag.dienst
        );

    if (!vorhanden) {

        eindeutig.push(
            eintrag
        );

    }

});


return eindeutig;

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
function getKW(datum) {

    const d =
        new Date(datum);

    d.setHours(0, 0, 0, 0);

    d.setDate(
        d.getDate() +
        4 -
        (d.getDay() || 7)
    );

    const jahrStart =
        new Date(
            d.getFullYear(),
            0,
            1
        );

    return Math.ceil(
        (
            (
                (d - jahrStart) /
                86400000
            ) + 1
        ) / 7
    );

}
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
    
let kwHeader =
    "<tr><th></th>";
    for (let i = 0; i < tage.length; i++) {

        const tag =
            tage[i];
        if (tag.getDay() === 1) {

    const kw =
        getKW(tag);

    kwHeader +=
        "<th colspan='7'>KW " +
        kw +
        "</th>";

}

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

  kwHeader += "</tr>";

thead.innerHTML =
    kwHeader +
    header;

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

async function ladePlanung() {

    const { data, error } =
        await supabaseClient
            .from("Planung")
            .select("*");

    if (error) {

        console.log(error);
        return;

    }

    plan = {};

    data.forEach(eintrag => {

        const key =
            getKey(
                eintrag.fahrer,
                eintrag.datum
            );

        plan[key] = {

            art:
                eintrag.art,

            dienst:
                eintrag.dienst || "",

            fahrzeug:
                eintrag.fahrzeug || ""

        };

    });

}
/* ==========================
   START
========================== */

window.onload = async function () {

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
 await ladeAbwesenheitsarten();
await ladeDienste();
await ladeFahrzeuge();
await ladeWochenmatrix();
await ladePlanung();
await ladeFahrer();
await ladeAlleFahrer();
 ladePlan ();
};
async function ladeWochenmatrix() {

    const { data, error } =
        await supabaseClient
            .from("Wochenmatrix")
            .select("*");

    wochenmatrix = data;
 

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
        .eq("status", "Aktiv")
       .order("sortierung");
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

}
async function ladeAlleFahrer() {

    const { data, error } =
        await supabaseClient
            .from("Fahrer_Stammdaten")
            .select("*")
            .order("sortierung");

    if (error) {

        console.log(error);
        return;

    }
    alleFahrer = data;

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
    const dienstOption =
    document.createElement(
        "option"
    );

dienstOption.value =
    "Dienst";

dienstOption.textContent =
    "Dienst";

artSelect.appendChild(
    dienstOption
);
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
const offene =
    offeneDiensteErmitteln().filter(
        d =>
            d.datum === aktuellesDatum
    );

const offeneGruppe =
    document.createElement(
        "optgroup"
    );

offeneGruppe.label =
    "🔴 Offene Dienste";
    offene.forEach(
    eintrag => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            eintrag.dienst;

        option.textContent =
            eintrag.dienst;

        offeneGruppe.appendChild(
            option
        );

    }
);

dienstSelect.appendChild(
    offeneGruppe
);
    const { data, error } =
       
        await supabaseClient
            .from("Dienste")
            .select("*")
            .order("bezeichnung");

    if (error) {

        console.log(error);
        return;
    }
     dienste =data;
const dienstGruppe =
    document.createElement(
        "optgroup"
    );

dienstGruppe.label =
    "📋 Reguläre Dienste";
    data.forEach(dienst => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            dienst.bezeichnung;

        option.textContent =
            dienst.bezeichnung;

        dienstGruppe.appendChild(
            option
        );

    });
    dienstSelect.appendChild(
    dienstGruppe
);
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
const standort =
        document.getElementById(
            "neuStandort"
        ).value.trim();
if (
    !kennzeichen ||
    !fahrzeugnummer ||
    !kategorie  ||
    !standort 
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
                standort:
                    standort,

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
       document.getElementById(
        "neuStandort"
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
     const statusDatum =
        document.getElementById(
            "fahrzeugStatusDatum").value;

    const { error } =
        await supabaseClient
            .from("Fahrzeug_Stammdaten")
            .update({
                status: neuerStatus,
     aktiv_ab:
        neuerStatus === "Aktiv"
            ? statusDatum
            : null,

    inaktiv_ab:
        neuerStatus === "Inaktiv"
            ? statusDatum
            : null,
    werkstatt_ab:
        neuerStatus === "Werkstatt"
            ? statusDatum
            : null,
 ausgeschieden_seit:
        neuerStatus === "Ausgeschieden"
            ? statusDatum
            : null
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

function dienstStatusAendern() {

    const select =
        document.getElementById(
            "dienstStatusSelect"
        );

    select.innerHTML = "";

    dienste.forEach(
        dienst => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                dienst.bezeichnung;

            option.textContent =
                dienst.bezeichnung;

            select.appendChild(
                option
            );

        }
    );

    document.getElementById(
        "dienstStatusOverlay"
    ).style.display = "flex";

}
function schliesseDienstStatus() {

    document.getElementById(
        "dienstStatusOverlay"
    ).style.display = "none";

}
async function dienstStatusSpeichern() {

const dienst =
    document.getElementById(
        "dienstStatusSelect"
    ).value;

console.log(
    "DIENST",
    dienst
);

const { data, error } =
    await supabaseClient
        .from("Dienste")
        .update({
            status: neuerStatus
        })
        .eq(
            "bezeichnung",
            dienst
        )
        .select();

console.log(
    "DATA",
    data
);

console.log(
    "ERROR",
    error
);

        return;

    }

    await ladeDienste();

    zeigeMeldung(
        "✅ Status geändert"
    );

    schliesseDienstStatus();

}

