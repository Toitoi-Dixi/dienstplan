async function speicherePlanEintrag(
    key,
    art,
    dienst,
    fahrzeug,
    alterEintrag
) {

    const gespeicherteDienste =
        art === "Dienst"
            ? dienst || ""
            : "";

    const gespeicherteFahrzeuge =
        art === "Dienst"
            ? fahrzeug || ""
            : "";

    plan[key] = {
        art: art,
        dienst: gespeicherteDienste,
        fahrzeug: gespeicherteFahrzeuge
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
                        gespeicherteDienste,

                    fahrzeug:
                        gespeicherteFahrzeuge
                }
            ]);

    if (error) {

        console.log(error);

        zeigeMeldung(
            "❌ Fehler beim Speichern"
        );

        return false;

    }

    schliessenModal();

    ladePlan();

    return true;

}
async function speichernZelle() {

    const art =
        document.getElementById("artInput").value;

    const dienst =
        document.getElementById("dienstInput").value;

    const fahrzeug =
        document.getElementById("fahrzeugInput").value;

    const key =
        getKey(
            aktuellerFahrer,
            aktuellesDatum
        );

    const alterEintrag =
        plan[key];

    // Abwesenheiten ersetzen einen vorhandenen Dienst oder ein direktes "Frei".
    // Für Abwesenheiten darf keine Dienstkonfliktprüfung laufen.
    if (
        istAbwesenheit(art)
    ) {
        await speicherePlanEintrag(
            key,
            art,
            "",
            "",
            alterEintrag
        );

        return;
    }

    // Das direkte Element "Frei" funktioniert weiterhin wie bisher.
    if (
        art === "Frei"
    ) {
        await speicherePlanEintrag(
            key,
            art,
            "",
            "",
            alterEintrag
        );

        return;
    }

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

                "Dienst bereits verplant",

                konflikt,

                "Trotzdem speichern",

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
