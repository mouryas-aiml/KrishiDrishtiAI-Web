import { CLASSES } from "./classes.js";

export interface KnowledgeSource {
  id: string;
  title: string;
  source: string;
  excerpt: string;
  score: number;
}

interface Document {
  id: string;
  title: string;
  source: string;
  text: string;
  terms: Map<string, number>;
}

const SOURCE_URL = "backend/src/classes.ts";

function tokenize(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]+/g) || [];
}

function createDocument(index: number, entry: (typeof CLASSES)[number]): Document {
  const text = [
    entry.crop,
    entry.disease,
    entry.symptoms,
    entry.prevention,
    entry.organicTreatment,
    entry.chemicalTreatment,
  ].join(" ");
  const terms = new Map<string, number>();
  for (const term of tokenize(text)) terms.set(term, (terms.get(term) || 0) + 1);
  return {
    id: `class-${index}`,
    title: `${entry.crop} - ${entry.disease}`,
    source: SOURCE_URL,
    text,
    terms,
  };
}

const documents = CLASSES
  .filter((entry) => !entry.isHealthy)
  .map((entry, index) => createDocument(index, entry));

export function retrieveKnowledge(query: string, limit = 3): KnowledgeSource[] {
  const queryTerms = tokenize(query);
  if (!queryTerms.length) return [];
  const queryCounts = new Map<string, number>();
  for (const term of queryTerms) queryCounts.set(term, (queryCounts.get(term) || 0) + 1);

  return documents
    .map((document) => {
      let dot = 0;
      let documentMagnitude = 0;
      let queryMagnitude = 0;
      for (const [term, count] of queryCounts) {
        const documentCount = document.terms.get(term) || 0;
        dot += count * documentCount;
        queryMagnitude += count * count;
      }
      for (const count of document.terms.values()) documentMagnitude += count * count;
      const score = documentMagnitude && queryMagnitude
        ? dot / (Math.sqrt(documentMagnitude) * Math.sqrt(queryMagnitude))
        : 0;
      return { document, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ document, score }) => ({
      id: document.id,
      title: document.title,
      source: document.source,
      excerpt: document.text,
      score: Number(score.toFixed(3)),
    }));
}
