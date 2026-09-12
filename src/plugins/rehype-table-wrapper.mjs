/**
 * 把 Markdown 渲染出的 <table> 包一层 <div class="md-table">。
 *
 * 为什么需要：Starlight 默认给表格 `display: block; overflow: auto`，表内匿名表格会
 * 收缩到内容宽度（宽窗口下右侧留白）。改成 `display: table; width: 100%` 后能铺满，
 * 但当单元格里有长路径 / 代码标识符时，min-content 会超过容器，导致表格撑破版面。
 * 包一层滚动容器后即可两全：装得下就铺满并换行，装不下就在容器内横向滚动。
 */
export default function rehypeTableWrapper() {
  return (tree) => {
    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['md-table'] },
            children: [child],
          };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
