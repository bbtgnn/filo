# Òla

---

Todo:

- Rifare effect NON point-free
- Poter usare il punto è auto-documentante. Molto meglio per questo
- Penso che sia possibile fare un wrapper intorno ad effect per renderlo point-style

---

Operazioni:

- seleziono il testo nel blocco
  | il componente del blocco visualizza il testo
  | Il blocco ha un metodo per splittarsi, data una selezione
  | - divido gli indici
  | - ottengo x blocchi
- premo invio per separarlo
  | Gestione shortcut
  | Stato globale: blocco selezionato
  | Stato globale: modalità "selezione"
- separo

- aggiungo i blocchi nelle varie sezioni:
  - blocchi[0] alla lista dei blocchi già fissati, al posto di quello tagliato
  - blocchi[1] lo metto in modalità "di aggancio"
  - blocchi[2]? se c'è, lo metto in area "di attesa"
    | di default, si aggancia dopo blocco[1]
    | agganciato blocco[1],
    | di default, blocchi[2] sta dopo blocchi[1]
    | e l'utente puù confermare o cambiare, nuovamente in modalità di aggancio
- quando sono in modalità di aggancio:
  - wasd spostano "in", la sorgente
  - arrows spostano "out", il target
  - con qualche tasto si conferma
- esco dalla modalità di aggancio,
  - con wasd cambio il centro di vista
