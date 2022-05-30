dofile("./json.lua")

local ws
local palettes = {} -- All the palettes that should be displayed on the screen
local totalResults
local dlgSearch
local dlgPalettes
local currentPage = 0

--[[
    Utilities
]]

local function splitByChunk(text, chunkSize)
    local s = {}
    for i=1, #text, chunkSize do
        s[#s+1] = text:sub(i, i+chunkSize - 1)
    end
    return s
end

-- Adds labels with a maximum lengths in characters
local function labelWithMaxLength(dlg, label, text, maxLength)
    if (text == nil) then
        return
    end

    local chunks = splitByChunk(text, maxLength)

    local id
    if (label ~= nil) then
        id = label
    end

    for di, textChunk in ipairs(chunks) do
        if (di == 1 and label ~= nil) then
            dlg:label{ id=id, label=label, text=textChunk }
        else
            dlg:label{ id=id, text=textChunk }
        end
        dlg:newrow()
    end
end

-- Takes all colors from a Palette object and adds them to the current Aseprite palette
local function usePalette(palette)
    for id, color in pairs(getAllColors(palette)) do
        app.command.AddColor {
            color=color
        }
    end
end

-- Classes
PaletteObject = { id = "", title = "", colors = {}, downloads = 0, description = "", likes = 0, username = ""}
PaletteObject.new = function (id, title, colors, downloads, description, likes, username)
    local self = {}
    self.id = id
    self.title = title
    self.colors = colors
    self.downloads = downloads
    self.description = description
    self.likes = likes
    self.username = username
    return self
end

function getAllColors(palette)
    local allColors = {}
    for id, colorRow in pairs(palette.colors) do
        for id, color in pairs(colorRow) do
            table.insert(allColors, color)
        end
    end
    return allColors
end

local function createPaletteElement(palette)
    if (palette == nil) then
        return
    end

    dlgPalettes:label{
        id="Title",
        label="Title",
        text=palette.title .. " - Created by " .. palette.username
    }

    dlgPalettes:label{
        id="Downloads",
        label="Downloads",
        text=palette.downloads
    }

    dlgPalettes:label{
        id="Likes",
        label="Likes",
        text=palette.likes
    }

    labelWithMaxLength(dlgPalettes, "Description", palette.description, 100)

    for rowNumber, colorsInRow in pairs(palette.colors) do
        dlgPalettes:shades{
            id="paletteColors",
            mode="pick",
            colors=colorsInRow,
            onclick=function()
                usePalette(palette)
            end
        }
        dlgPalettes:newrow()
    end

    dlgPalettes:label{
        id="paletteColorsActionsLabel",
        label="Actions",
        text="",
    }
end

local function createResultsDialog(page)
    if #palettes <= 0 then
        return
    end
    local pageAmount = math.ceil(totalResults / 10)

    dlgPalettes = Dialog(totalResults .. " palettes are matching your criteria. Page " .. currentPage+1 .. " / " .. pageAmount .. ". Palette " .. page .. " / " .. #palettes)

    createPaletteElement(palettes[page])

    local bounds = dlgPalettes.bounds
    bounds.y = 20
    bounds.x = 400
    bounds.width = 500

    if (currentPage > 0 or page > 1) then
        local isButtonPageChange = page - 1 < 1
        local label = "palette"
        if isButtonPageChange then
            label = "page"
        end

        dlgPalettes:button{
            id="confirm",
            text="Previous ".. label .." <",
            onclick=function()
                dlgPalettes:close()
                if isButtonPageChange then
                    search(currentPage - 1)
                else
                    createResultsDialog(page - 1)
                end
            end }
    end

    dlgPalettes:button{ id="use_palette", text="Add colors to my palette", onclick=function() usePalette(palettes[page]) end }

    if (currentPage < pageAmount or page < #palettes) then
        local isButtonPageChange = page + 1 > #palettes
        local label = "palette"
        if isButtonPageChange then
            label = "page"
        end

        dlgPalettes:button{
            id="confirm",
            text="Next ".. label .." >",
            onclick=function()
                dlgPalettes:close()
                if page + 1 > #palettes then
                    search(currentPage + 1)
                else
                    createResultsDialog(page + 1)
                end
            end }
    end

    dlgPalettes:show{ bounds=bounds, wait=false }
end

-- This function is called when we get a response from our server in JSON after searching.
-- We instantiate Palette objects and add them to the global "palettes" array
local function handleSearchResponse(response)
    totalResults = response.totalCount

    palettes = {}

    for id, v in pairs(response.palettes) do
        local colors = v.colors

        local colorsObjects = {}
        local i = 0
        local row = 0
        local colorsPerRow = 20
        for colorKey, colorValue in pairs(colors) do
            local newColor = Color { r=colorValue.red, g=colorValue.green, b=colorValue.blue }
            if colorsObjects[row] == nil then
                colorsObjects[row] = { newColor }
            else
                table.insert(colorsObjects[row], newColor)
            end

            if (i == colorsPerRow) then
                i = 0
                row = row + 1
            else
                i = i + 1
            end
        end

        local username
        if v.user == nil then
            username = "Unknown"
        else
            username = v.user.name
        end

        local paletteToAdd = PaletteObject.new(id, v.title, colorsObjects, v.downloads, v.description, v.likes, username)
        table.insert(palettes, paletteToAdd)
    end

    createResultsDialog(1)
end

local function handleMessage(mt, data)
    if mt == WebSocketMessageType.OPEN then
    elseif mt == WebSocketMessageType.TEXT then
        local response = json.decode(data)

        if (response.type == "search") then
            handleSearchResponse(response)
        end

    elseif mt == WebSocketMessageType.CLOSE then
    end
end

ws = WebSocket{
    onreceive = handleMessage,
    url = "http://orys.ddns.net:5001/",
    deflate = false
}

-- Build request to send to server from dialog window data (the selected from values)
function search(page)
    if page == nil then
        page = 0
    end

    currentPage = page

    local data = dlgSearch.data
    local request = {
        ["colorNumberFilterType"] = data.colorNumberFilterType,
        ["colorNumber"] = data.colorNumber,
        ["page"] = page,
        ["tag"] = data.tag,
        ["sortingType"] = data.sortingType
    }

    local msg = json.encode(request)
    ws:sendText(msg)
end

local function createSearchForm()
    dlgSearch:label{
        label="Lospec Palette",
        text="The Lospec Palette List is a database of palettes for pixel art."
    }

    dlgSearch:combobox{
        id="colorNumberFilterType",
        label="Number of colors",
        option="colorNumberFilterType",
        options={ "Any", "Max", "Min", "Exact" },
    }

    dlgSearch:slider{
        id="colorNumber",
        label="",
        min=2,
        max=256,
        value=8
    }

    dlgSearch:entry{
        id="tag",
        label="Search by tag :",
        text="",
    }

    dlgSearch:combobox{
        id="sortingType",
        label="Sorting",
        option="sortingType",
        options={ "Default", "A-Z", "Downloads", "Newest" }
    }

    dlgSearch:newrow()
    dlgSearch:button{ id="searchButton", text="Search", onclick=function() search() end }
end

function init(plugin)
    plugin:newCommand{
        id="LospecPalettes",
        title="Lospec palettes",
        group="view_extras",
        onclick=function()
            ws:connect()

            dlgSearch = Dialog{title="Lospec palettes - Search", onclose=function()
                palettes = {}
            end}
            createSearchForm()

            local bounds = dlgSearch.bounds
            bounds.y = 20
            bounds.x = 20

            dlgSearch:show{ bounds=bounds, wait=false }
        end
    }
end

function exit(plugin)
    palettes = {}
    ws:close()
end
