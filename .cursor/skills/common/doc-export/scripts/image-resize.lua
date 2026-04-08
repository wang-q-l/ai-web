--[[
图片自适应 Lua Filter
- 设置图片宽度为页面宽度的 90%
- 设置图片最大高度为 24cm（确保在一页内完整显示）
- 图片会自动选择较小的缩放比例，保持完整显示
]]

function Para(para)
  -- 查找段落中的图片
  local images = {}
  for i, elem in ipairs(para.content) do
    if elem.t == "Image" then
      table.insert(images, elem)
    end
  end

  -- 如果段落包含图片，只保留图片，移除所有其他内容
  if #images > 0 then
    local img = images[1]  -- 取第一张图片

    -- 设置图片宽度和最大高度
    img.attributes.width = "90%"
    img.attributes.height = "24cm"

    -- 返回只包含图片的段落
    return pandoc.Para({img})
  end

  return para
end
