local M = {}


---@param foreground string foreground color
---@param background string background color
---@param alpha number|string number between 0 and 1. 0 results in bg, 1 results in fg
function M.blend(foreground, background, alpha)
    alpha = type(alpha) == "string" and (tonumber(alpha, 16) / 0xff) or alpha

    local fg = M.hex_to_rgb(foreground)
    local bg = M.hex_to_rgb(background)

    local blend_channel = function(i)
        local ret = (alpha * fg[i] + ((1 - alpha) * bg[i]))
        return math.floor(math.min(math.max(0, ret), 255) + 0.5)
    end

    return string.format("#%02x%02x%02x", blend_channel(1), blend_channel(2), blend_channel(3)):upper()
end

function M.hex_to_rgb(hex)
    if hex == nil or hex == "None" then
        return { 0, 0, 0 }
    end

    hex = hex:gsub("#", "")
    hex = string.lower(hex)

    return {
        tonumber(hex:sub(1, 2), 16),
        tonumber(hex:sub(3, 4), 16),
        tonumber(hex:sub(5, 6), 16),
    }
end

function M.int_to_hex(int)
    if int == nil then
        return "None"
    end

    return string.format("#%06X", int)
end

function M.wrap_text(text, max_length)
    local lines = {}
    local line = ''

    for word in text:gmatch("%S+") do
        if #line + #word <= max_length then
            line = line .. ' ' .. word
        else
            table.insert(lines, line)
            line = word
        end
    end

    table.insert(lines, line)

    return lines
end

return M
