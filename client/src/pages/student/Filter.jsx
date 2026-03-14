import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const categories = [
  { id: "nextjs", label: "Next JS" },
  { id: "data science", label: "Data Science" },
  { id: "frontend development", label: "Frontend Development" },
  { id: "fullstack development", label: "Fullstack Development" },
  { id: "mern stack development", label: "MERN Stack Development" },
  { id: "backend development", label: "Backend Development" },
  { id: "javascript", label: "Javascript" },
  { id: "python", label: "Python" },
  { id: "docker", label: "Docker" },
  { id: "mongodb", label: "MongoDB" },
  { id: "html", label: "HTML" },
];

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

const handleCategoryChange = (categoryId) => {
    // 1. نحسب المصفوفة الجديدة الأول
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    // 2. نحدث الـ State بتاعة الفلتر
    setSelectedCategories(newCategories);
    
    // 3. نبعت البيانات للصفحة الأب
    handleFilterChange(newCategories, sortByPrice);
  };
  
  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  }

  const selectedCount = selectedCategories.length;

  return (
    <div className="w-full md:w-[26%]">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <h1 className="font-semibold text-lg md:text-xl">Filter Options</h1>
          </div>
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {selectedCount}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-xl md:hidden"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              Filters
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        <div className={`${isExpanded ? "mt-4 block" : "hidden"} md:mt-4 md:block`}>
          <div className="mb-4">
            <Select onValueChange={selectByPriceHandler}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Sort by price" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort by price</SelectLabel>
                  <SelectItem value="low">Low to High</SelectItem>
                  <SelectItem value="high">High to Low</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          <div>
            <h1 className="mb-2 text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">CATEGORY</h1>
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1 md:max-h-none md:overflow-visible">
              {categories.map((category) => (
                <label
                  key={category.id}
                  htmlFor={category.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <Label className="cursor-pointer text-sm font-medium leading-none">
                    {category.label}
                  </Label>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;