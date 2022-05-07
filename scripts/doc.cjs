const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const pkg = require('../package.json');

const readDirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const README_FILENAME_RECORD = {
  name: 'readme',
  ext: '.md',
};

const HEAD_LEVEL = 2;
const MAX_DEPTH = HEAD_LEVEL + 4;

const CONTENT_DIR_LIST = ['algorithm', 'data-structure'];

const MARKDOWN_INDENT_WIDTH = 2;

const MARKDOWN_TAG_TEMPLATE_RECORD = {
  a: '[{{content}}]({{href}})',
  li: '{{indent}}- {{content}}\n',
  default: '{{content}}\n',
};

function appendHeadTagToMDRecord() {
  Array.from({ length: MAX_DEPTH }, (_, i) => i + 1).forEach((level) => {
    MARKDOWN_TAG_TEMPLATE_RECORD[`h${level}`] =
      MARKDOWN_TAG_TEMPLATE_RECORD[`h${level}`] ??
      `${Array.from({ length: level }).join('#')} {{content}}\n`;
  });
}

/**
 * @typedef {{
 *  type: keyof HTMLElementTagNameMap
 *  children: (string|DocNode|null)[]
 *  props: Record<string,any>
 * }} DocNode
 */

/**
 * @param { DocNode['type'] } type
 * @param { DocNode['props'] } props
 * @param { DocNode['children'] }
 * @returns { DocNode }
 */
function createDocNode(type, props, children) {
  return {
    type,
    props,
    children,
  };
}

function isEmptyNode(node) {
  return (
    node === null || typeof node === 'undefined' || typeof node === 'boolean'
  );
}

/**
 * @param { DocNode } docNode
 */
function renderToHTML(docNode) {
  if (typeof docNode === 'string') return docNode;
  const props = docNode.props ?? {};
  const propToAttrString = Object.keys(props)
    .map((pk) => `${pk}="${props[pk]}"`)
    .join(' ');
  return `<${docNode.type} ${propToAttrString}>
    ${docNode.children
      .filter((n) => !isEmptyNode(n))
      .map((n) => renderToHTML(n))
      .join('')}
  </${docNode.type}>`;
}

/**
 * @param { string } template
 */
function renderMDTemplate(template, data) {
  data = data ?? {};
  return template.replace(/\{\{(.*?)\}\}/g, (match, $1) => {
    if (typeof $1 === 'string') $1 = $1.trim();
    return data[$1] ?? '';
  });
}

/**
 * @param { DocNode } docNode
 */
function renderToMarkdown(docNode, depth = 0) {
  if (typeof docNode === 'string') return docNode;
  let templ = MARKDOWN_TAG_TEMPLATE_RECORD[docNode.type];
  let nextDep = depth + 1;
  let indentCount = depth * MARKDOWN_INDENT_WIDTH;

  if (!templ) {
    templ = MARKDOWN_TAG_TEMPLATE_RECORD.default;
    nextDep = depth;
    indentCount = 0;
  }

  const indent = Array.from({ length: indentCount }, () => ' ').join('');

  const content = docNode.children
    .filter((c) => !isEmptyNode(c))
    .map((c) => renderToMarkdown(c, nextDep))
    .join('');

  const ctx = {
    ...(docNode.props ?? {}),
    content,
    indent,
  };

  return renderMDTemplate(templ, ctx);
}

async function getContentList(
  ctx,
  depth = HEAD_LEVEL + 1,
  includeDirNameList = null
) {
  if (depth >= MAX_DEPTH) return null;
  const curDirFilenameList = await readDirAsync(ctx.path);
  includeDirNameList = Array.isArray(includeDirNameList)
    ? includeDirNameList
    : curDirFilenameList;
  const curDirFileStatList = await Promise.all(
    curDirFilenameList.map((fname) => statAsync(path.join(ctx.path, fname)))
  );
  const curDirCtxList = curDirFilenameList
    .filter(
      (fname, index) =>
        curDirFileStatList[index] &&
        curDirFileStatList[index].isDirectory() &&
        includeDirNameList.includes(fname)
    )
    .map((d) => ({
      name: d,
      path: path.join(ctx.path, d),
      href: `${ctx.href}/${d}`,
    }));

  async function composeNode(dirCtx) {
    const a = createDocNode(
      'a',
      {
        href: `${dirCtx.href}#${README_FILENAME_RECORD.name}`,
      },
      [dirCtx.name]
    );
    const h = createDocNode(`h${depth}`, null, [a]);
    const nextList = await getContentList(dirCtx, depth + 1);
    const li = createDocNode('li', null, [h, nextList]);
    return li;
  }

  const childList = await Promise.all(curDirCtxList.map(composeNode));

  const list = createDocNode('ul', null, childList);
  return list;
}

async function formatDoc() {
  const name = pkg.name;
  const relPath = '../src';
  const ctx = {
    name,
    path: path.join(__dirname, relPath),
    href: path.parse(relPath).name,
  };

  const contentNodeList = await getContentList(
    ctx,
    HEAD_LEVEL + 1,
    CONTENT_DIR_LIST
  );

  const docNode = createDocNode('main', null, [
    createDocNode(`h${HEAD_LEVEL}`, null, [name]),
    contentNodeList,
  ]);

  const markdown = renderToMarkdown(docNode);

  fs.writeFileSync(path.join(__dirname, '../README.md'), markdown, {
    encoding: 'utf-8',
  });
}

async function main() {
  try {
    appendHeadTagToMDRecord();
    await formatDoc();
  } catch (e) {
    console.error('[generate doc failed]:', e.message);
  }
}

main();
