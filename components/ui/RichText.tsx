"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface RichTextProps {
  content: string;
  className?: string;
}

type BlockType = "paragraph" | "ordered-list" | "unordered-list";

interface TextBlock {
  type: BlockType;
  items: string[];
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
        <span key={keyIndex++} className="text-foreground font-semibold">
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

// Разбивает контент на блоки (параграфы, списки)
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
    
    // Проверяем нумерованный список (1. текст, 2. текст и т.д.)
    const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      if (currentBlock?.type !== "ordered-list") {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { type: "ordered-list", items: [] };
      }
      currentBlock.items.push(orderedMatch[2]);
      continue;
    }
    
    // Проверяем маркированный список (- текст или • текст)
    const unorderedMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
    if (unorderedMatch) {
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
    <div className={cn("space-y-6", className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <motion.p
                key={index}
                className="text-[28px] leading-[35px] text-muted-foreground font-medium"
                variants={itemVariants}
              >
                {parseInlineFormatting(block.items.join(" "))}
              </motion.p>
            );
          
          case "ordered-list":
            return (
              <motion.ol
                key={index}
                className="space-y-3 text-[28px] leading-[35px] text-muted-foreground font-medium"
                variants={itemVariants}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex">
                    <span className="text-foreground font-medium w-[32px] shrink-0">
                      {itemIndex + 1}.
                    </span>
                    <span>{parseInlineFormatting(item)}</span>
                  </li>
                ))}
              </motion.ol>
            );
          
          case "unordered-list":
            return (
              <motion.ul
                key={index}
                className="space-y-3 text-[28px] leading-[35px] text-muted-foreground font-medium"
                variants={itemVariants}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex">
                    <span className="text-muted-foreground w-[32px] shrink-0">•</span>
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
