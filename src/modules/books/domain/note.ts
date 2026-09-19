export type Note = {
    id: number;
    title: string;
    bookId: number;
    content: string;
    createdAt: string;
};

// «1 заметка», «2 заметки», «5 заметок»
export function pluralizeNotes(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return `${count} заметка`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} заметки`;
    return `${count} заметок`;
}
