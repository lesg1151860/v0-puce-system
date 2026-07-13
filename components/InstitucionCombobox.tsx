"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {Command,CommandEmpty,CommandGroup,CommandInput,CommandItem,CommandList} from "@/components/ui/command"
import {Popover,PopoverContent,PopoverTrigger} from "@/components/ui/popover"

export function InstitucionCombobox({ 
    opciones, 
    value, 
    onChange, 
    placeholder = "Seleccione una Institución...",
    disabled = false
}: { 
    opciones: any[], 
    value: string, 
    onChange: (val: string) => void,
    placeholder?: string
    disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {value
            ? opciones.find((op) => op.id.toString() === value)?.nombre || 
              opciones.find((op) => op.id.toString() === value)?.nombre_ie
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar I.E...." />
          <CommandList>
            <CommandEmpty>No se encontró la institución.</CommandEmpty>
            <CommandGroup>
              {opciones.map((op) => (
                <CommandItem
                  key={op.id}
                  value={op.nombre || op.nombre_ie}
                  onSelect={() => {
                    onChange(op.id.toString())
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === op.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {op.nombre || op.nombre_ie}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}