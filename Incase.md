const parseCSV = (text) => {
const lines = text.trim().split("\n");
const headers = lines[0].split(";").map((h) => h.trim()); // ← , devient ;
return lines.slice(1).map((line) => {
const row = {};
const regex = /(".\*?"|[^;]+)(?=;|$)/g; // ← , devient ; dans la regex aussi
    const values = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      values.push(match[1].replace(/^"|"$/g, "").trim());
}
headers.forEach((h, i) => (row[h] = values[i] ?? ""));
return row;
});
};
