"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

const _frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

export interface ComboboxProps {
  title: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onSelectionChange?: (value: string) => void;
  value?: string;
}

export function ComboboxDemo({
  title,
  placeholder,
  options = [],
  onSelectionChange,
  value,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const initialOption = options.find((option) => option.value === value);
  console.log("value");
  console.log(value);
  console.log(initialOption);
  const [_value, _setValue] = React.useState(value ?? "");
  const [label, setLabel] = React.useState(initialOption?.label ?? "");
  const handleSelectionChange = (currentLabel: string) => {
    const newLabel = currentLabel === label.toLowerCase() ? "" : currentLabel;
    if (onSelectionChange) {
      onSelectionChange(
        options.find((option) => option.label.toLowerCase() === newLabel)
          ?.value ?? ""
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={true}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {label || title}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {options?.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={(currentLabel) => {
                  handleSelectionChange(currentLabel);
                  setLabel(currentLabel === label ? "" : currentLabel);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    label === option.label ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
