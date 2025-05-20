/* ========== KONFIGURASI UTAMA ========== */
let currentChapter = 1; // Menyimpan nomor BAB aktif

/* ========== FUNGSI FORMATTING ========== */

// 1. Format BAB (Alt+1)
Office.actions.associate("formatBAB", async (event) => {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    currentChapter = await getNextNumber(context, "BAB");
    selection.style = "Heading1";
    selection.text = `BAB ${currentChapter}`;
    await context.sync();
    event.completed();
  });
});

// 2. Format BAB tanpa label (Alt+Shift+1)
Office.actions.associate("formatBABNoLabel", async (event) => {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    currentChapter = await getNextNumber(context, "BAB");
    selection.style = "Heading1";
    selection.text = `${currentChapter}`;
    await context.sync();
    event.completed();
  });
});

// 3. Format Sub-BAB (Alt+2 sampai Alt+5)
Office.actions.associate("formatSubBAB", async (event) => {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    const level = event.source.id.split("-")[1]; // Ambil level dari ID (1-4)
    selection.style = `Heading${level+1}`;
    await context.sync();
    event.completed();
  });
});

/* ========== PENOMORAN HALAMAN ========== */

// 4. Penomoran Halaman (Alt+Ctrl+K)
Office.actions.associate("insertPageNumber", async (event) => {
  await Word.run(async (context) => {
    const footer = context.document.sections.getFirst().getFooter("primary");
    footer.clear();
    footer.insertPageNumber("Center", "Arabic");
    await context.sync();
    event.completed();
  });
});

// 5. Angka Romawi (Alt+R)
Office.actions.associate("insertRomanNumbers", async (event) => {
  await Word.run(async (context) => {
    const footer = context.document.sections.getFirst().getFooter("primary");
    footer.clear();
    footer.insertPageNumber("Center", "LowerRoman");
    await context.sync();
    event.completed();
  });
});

/* ========== AUTO-CAPTION ========== */

// 6. Caption Gambar 1-digit (Alt+G)
Office.actions.associate("insertImageCaption1", async (event) => {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.insertText(`Gambar ${await getNextNumber(context, "Gambar")}. `, "After");
    await context.sync();
    event.completed();
  });
});

// 7. Caption Gambar 2-digit (Alt+Ctrl+G)
Office.actions.associate("insertImageCaption2", async (event) => {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.insertText(`Gambar ${currentChapter}.${await getNextNumber(context, "Gambar-"+currentChapter)} `, "After");
    await context.sync();
    event.completed();
  });
});

// 8. Caption Tabel 2-digit (Alt+Ctrl+T)
Office.actions.associate("insertTableCaption", async (event) => {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.insertText(`Tabel ${currentChapter}.${await getNextNumber(context, "Tabel-"+currentChapter)} `, "After");
    await context.sync();
    event.completed();
  });
});

/* ========== DAFTAR OTOMATIS ========== */

// 9. Daftar Isi (Alt+D)
Office.actions.associate("insertTOC", async (event) => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertTableOfContents();
    await context.sync();
    event.completed();
  });
});

// 10. Daftar Gambar (Alt+Shift+G)
Office.actions.associate("insertListOfFigures", async (event) => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertTableOfFigures("Gambar");
    await context.sync();
    event.completed();
  });
});

// 11. Daftar Tabel (Alt+Shift+T)
Office.actions.associate("insertListOfTables", async (event) => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertTableOfFigures("Tabel");
    await context.sync();
    event.completed();
  });
});

/* ========== FITUR LANJUTAN ========== */

// 12. Buat Section (Alt+N)
Office.actions.associate("insertSection", async (event) => {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.insertBreak("sectionNext");
    await context.sync();
    event.completed();
  });
});

// 13. Deteksi BAB Otomatis (Alt+Shift+K)
Office.actions.associate("detectChapter", async (event) => {
  await Word.run(async (context) => {
    const headings = context.document.body.search("BAB", {matchCase: true});
    context.load(headings);
    await context.sync();
    currentChapter = headings.items.length;
    event.completed();
  });
});

// 14. Refresh All (Alt+U)
Office.actions.associate("refreshAll", async (event) => {
  await Word.run(async (context) => {
    const contentControls = context.document.contentControls;
    contentControls.load("items");
    await context.sync();
    
    contentControls.items.forEach(cc => {
      cc.refresh();
    });
    
    await context.sync();
    event.completed();
  });
});

/* ========== FUNGSI BANTU ========== */
async function getNextNumber(context, type) {
  const searchResults = context.document.body.search(`${type}`, {matchCase: true});
  context.load(searchResults);
  await context.sync();
  return searchResults.items.length + 1;
}