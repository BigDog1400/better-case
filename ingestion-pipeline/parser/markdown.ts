export interface HeadingNode {
    id: string
    level: number
    text: string
    line: number
    children: HeadingNode[]
    content?: string
  }
  
  export interface MarkdownHierarchy {
    headings: HeadingNode[]
    statistics: {
      totalHeadings: number
      levelCounts: Record<number, number>
      totalLines: number
    }
  }
  
  /**
   * Parses markdown content and returns a hierarchical structure of headings
   * @param markdown - The markdown content as a string
   * @returns MarkdownHierarchy object containing headings and statistics
   */
  export function parseMarkdownHierarchy(markdown: string): MarkdownHierarchy {
    const lines = markdown.split("\n")
    const headings: HeadingNode[] = []
    const stack: HeadingNode[] = []
  
    // Parse headings and build hierarchy
    lines.forEach((line, index) => {
      const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line)
      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2].trim()
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
  
        const node: HeadingNode = {
          id,
          level,
          text,
          line: index + 1,
          children: [],
        }
  
        // Find the correct parent based on heading level
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop()
        }
  
        if (stack.length === 0) {
          headings.push(node)
        } else {
          stack[stack.length - 1].children.push(node)
        }
  
        stack.push(node)
      }
    })
  
    // Add content preview for each heading
    const addContentPreview = (nodes: HeadingNode[]) => {
      nodes.forEach((node) => {
        const startLine = node.line
        let endLine = lines.length
  
        // Find the next heading at the same or higher level
        for (let i = startLine; i < lines.length; i++) {
          const line = lines[i]
          const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line)
          if (headingMatch && headingMatch[1].length <= node.level) {
            endLine = i
            break
          }
        }
  
        // Extract content (skip the heading line itself)
        const contentLines = lines.slice(startLine, endLine)
        const content = contentLines
          .filter((line) => !(/^#{1,6}\s+/.exec(line)))
          .join("\n")
          .trim()
          .substring(0, 150)
  
        node.content = content || "No content"
        addContentPreview(node.children)
      })
    }
  
    addContentPreview(headings)
  
    // Calculate statistics
    const calculateStats = (nodes: HeadingNode[]) => {
      let totalHeadings = 0
      const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  
      const countNodes = (nodeList: HeadingNode[]) => {
        nodeList.forEach((node) => {
          totalHeadings++
          if (node.level >= 1 && node.level <= 6) {
            levelCounts[node.level]++
          }
          countNodes(node.children)
        })
      }
  
      countNodes(nodes)
  
      return {
        totalHeadings,
        levelCounts,
        totalLines: lines.length,
      }
    }
  
    const statistics = calculateStats(headings)
  
    return {
      headings,
      statistics,
    }
  }

  
  /**
   * Converts the hierarchy to a flat list of headings with depth indicators
   * @param hierarchy - The parsed markdown hierarchy
   * @returns Array of flattened heading objects
   */
  export function flattenHierarchy(hierarchy: MarkdownHierarchy) {
    const flattened: Array<HeadingNode & { depth: number }> = []
  
    const flatten = (nodes: HeadingNode[], depth = 0) => {
      nodes.forEach((node) => {
        flattened.push({ ...node, depth })
        flatten(node.children, depth + 1)
      })
    }
  
    flatten(hierarchy.headings)
    return flattened
  }
  
  /**
   * Generates a table of contents from the hierarchy
   * @param hierarchy - The parsed markdown hierarchy
   * @returns String representation of table of contents
   */
  export function generateTableOfContents(hierarchy: MarkdownHierarchy): string {
    const generateTOC = (nodes: HeadingNode[], depth = 0): string => {
      return nodes
        .map((node) => {
          const indent = "  ".repeat(depth)
          const link = `${indent}- [${node.text}](#${node.id})`
          const childTOC = node.children.length > 0 ? "\n" + generateTOC(node.children, depth + 1) : ""
          return link + childTOC
        })
        .join("\n")
    }
  
    return generateTOC(hierarchy.headings)
  }
  
  /**
   * Finds a heading by its ID in the hierarchy
   * @param hierarchy - The parsed markdown hierarchy
   * @param id - The heading ID to search for
   * @returns The found heading node or null
   */
  export function findHeadingById(hierarchy: MarkdownHierarchy, id: string): HeadingNode | null {
    const search = (nodes: HeadingNode[]): HeadingNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node
        const found = search(node.children)
        if (found) return found
      }
      return null
    }
  
    return search(hierarchy.headings)
  }
  