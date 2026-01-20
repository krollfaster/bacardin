"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface RichTextProps {
  content: string;
  className?: string;
}

type BlockType = "paragraph" | "ordered-list" | "unordered-list" | "heading";

// Подпункт вложенного списка
interface NestedListItem {
  text: string;
}

// Элемент основного списка с возможными вложенными подпунктами
interface ListItem {
  text: string;
  nested?: NestedListItem[];
}

interface TextBlock {
  type: BlockType;
  items: string[];
  listItems?: ListItem[]; // Для списков с поддержкой вложенности
}

// Функция для определения отступа между блоками
function getMarginTop(currentType: BlockType, prevType: BlockType | null, isFirst: boolean): string {
  // Первый блок без отступа сверху
  if (isFirst) return "";

  // H2 заголовок всегда имеет margin-top 28px (кроме первого)
  if (currentType === "heading") return "mt-[28px]";

  // После H2 заголовка отступ уже задан через margin-bottom заголовка
  if (prevType === "heading") return "";

  // Между текстом и списком (или наоборот) - 22px
  const isList = (type: BlockType) => type === "ordered-list" || type === "unordered-list";
  if (
    (currentType === "paragraph" && prevType && isList(prevType)) ||
    (isList(currentType) && prevType === "paragraph")
  ) {
    return "mt-[22px]";
  }

  // Между двумя параграфами или двумя списками - 22px
  return "mt-[22px]";
}

// Парсит инлайн форматирование: **bold** и *italic*
function parseInlineFormatting(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];

  // Регулярка для поиска **bold** и *italic*
  // Порядок важен: сначала ищем **, потом *
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g;

  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Добавляем текст до match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold** - белый выделенный текст
      result.push(
        <span key={keyIndex++} className="font-semibold text-foreground">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // *italic* - курсив
      result.push(
        <em key={keyIndex++} className="italic">
          {match[4]}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

// Разбивает контент на блоки (параграфы, списки, заголовки) с поддержкой вложенности
function parseBlocks(content: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const lines = content.split("\n");

  let currentBlock: TextBlock | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Пустая строка - завершаем текущий блок
    if (!trimmedLine) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // Проверяем H2 заголовок (## текст)
    const headingMatch = trimmedLine.match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      blocks.push({ type: "heading", items: [headingMatch[1]] });
      currentBlock = null;
      continue;
    }

    // Определяем отступ в начале строки
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length ?? 0;
    const isNested = leadingSpaces >= 2;

    // Проверяем нумерованный список (1. текст, 2. текст и т.д.)
    const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch && !isNested) {
      if (currentBlock?.type !== "ordered-list") {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: "ordered-list", items: [], listItems: [] };
      }
      currentBlock.listItems = currentBlock.listItems ?? [];
      currentBlock.listItems.push({ text: orderedMatch[2] });
      currentBlock.items.push(orderedMatch[2]);
      continue;
    }

    // Проверяем маркированный список (- текст или • текст)
    const unorderedMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
    if (unorderedMatch) {
      // Если это вложенный элемент (с отступом) и мы внутри нумерованного списка
      if (isNested && currentBlock?.type === "ordered-list" && currentBlock.listItems && currentBlock.listItems.length > 0) {
        // Добавляем как вложенный элемент к последнему пункту
        const lastItem = currentBlock.listItems[currentBlock.listItems.length - 1];
        lastItem.nested = lastItem.nested ?? [];
        lastItem.nested.push({ text: unorderedMatch[1] });
        continue;
      }

      // Обычный маркированный список (без вложенности)
      if (currentBlock?.type !== "unordered-list") {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: "unordered-list", items: [] };
      }
      currentBlock.items.push(unorderedMatch[1]);
      continue;
    }

    // Обычный текст - параграф
    if (currentBlock?.type !== "paragraph") {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = { type: "paragraph", items: [] };
    }
    currentBlock.items.push(trimmedLine);
  }

  // Добавляем последний блок
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function RichText({ content, className }: RichTextProps) {
  const blocks = parseBlocks(content);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      {blocks.map((block, index) => {
        const prevType = index > 0 ? blocks[index - 1].type : null;
        const marginTop = getMarginTop(block.type, prevType, index === 0);

        switch (block.type) {
          case "heading":
            return (
              <motion.h2
                key={index}
                className={cn(
                  "mb-[10px] font-bold text-[28px] text-foreground leading-[35px]",
                  marginTop
                )}
                variants={itemVariants}
              >
                {block.items[0]}
              </motion.h2>
            );

          case "paragraph":
            return (
              <motion.p
                key={index}
                className={cn(
                  "font-medium text-[28px] text-muted-foreground leading-[35px]",
                  marginTop
                )}
                variants={itemVariants}
              >
                {parseInlineFormatting(block.items.join(" "))}
              </motion.p>
            );

          case "ordered-list":
            return (
              <motion.ol
                key={index}
                className={cn(
                  "space-y-[14px] font-medium text-[28px] text-muted-foreground leading-[35px]",
                  marginTop
                )}
                variants={itemVariants}
              >
                {(block.listItems ?? block.items.map(text => ({ text })) as ListItem[]).map((item, itemIndex) => (
                  <li key={itemIndex} className="flex flex-col">
                    <div className="flex">
                      <span className="w-[32px] text-muted-foreground shrink-0">
                        {itemIndex + 1}.
                      </span>
                      <span>{parseInlineFormatting(item.text)}</span>
                    </div>
                    {/* Вложенный маркированный список */}
                    {item.nested && item.nested.length > 0 && (
                      <ul className="space-y-[10px] mt-[10px] ml-[32px]">
                        {item.nested.map((nestedItem, nestedIndex) => (
                          <li key={nestedIndex} className="flex">
                            <span className="w-[24px] text-muted-foreground shrink-0">•</span>
                            <span>{parseInlineFormatting(nestedItem.text)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </motion.ol>
            );

          case "unordered-list":
            return (
              <motion.ul
                key={index}
                className={cn(
                  "space-y-[14px] font-medium text-[28px] text-muted-foreground leading-[35px]",
                  marginTop
                )}
                variants={itemVariants}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex">
                    <span className="pl-[7px] w-[32px] text-muted-foreground shrink-0">•</span>
                    <span>{parseInlineFormatting(item)}</span>
                  </li>
                ))}
              </motion.ul>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
