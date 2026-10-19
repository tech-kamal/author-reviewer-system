"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateManuscriptId = void 0;
const generateManuscriptId = (date, initials, sequenceNumber) => {
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const paddedSequence = String(sequenceNumber).padStart(4, "0");
    return `${year}${month}${day}_ACM_${initials}_${year}${paddedSequence}`;
};
exports.generateManuscriptId = generateManuscriptId;
