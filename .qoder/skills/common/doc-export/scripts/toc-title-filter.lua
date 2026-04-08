-- Pandoc Lua filter to replace TOC title
function Meta(meta)
  -- 设置 TOC 标题为中文
  meta['toc-title'] = '目录'
  return meta
end
