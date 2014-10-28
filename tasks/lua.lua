function eraseTerminal ()
  io.write("\27[2J")
end

function getResult (s)
  if s >= 1 then
    return s;
  end
  if s < 1 then
    return 0;
  end
end

function save (name, value, saved)
  if type(value) == "number" or type(value) == "string" then
    io.write(basicSerialize(value), "\n")
  end
  if type(value) == "table" then
    if saved[value]
      io.write(saved[value], "\n")
    end
  end
end