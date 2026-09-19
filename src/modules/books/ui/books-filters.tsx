'use client';

import { ChevronDown, Search, Tag, X } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
    BOOKS_SORT_OPTIONS,
    BOOK_STATUS_LABELS,
    BOOK_STATUS_ORDER,
    type BooksSort,
} from '../domain/book-filters';
import type { BookStatus } from '../domain/book';

const RATING_OPTIONS = [0, 4, 5, 6, 7, 8, 9];

type BooksFiltersProps = {
    search: string;
    setSearch: (search: string) => void;
    statuses: BookStatus[];
    toggleStatus: (status: BookStatus) => void;
    tags: string[];
    selectedTags: string[];
    toggleTag: (tag: string) => void;
    minRating: number;
    setMinRating: (minRating: number) => void;
    sort: BooksSort;
    setSort: (sort: BooksSort) => void;
    clearFilters: () => void;
    hasFilters: boolean;
};

export function BooksFilters(props: BooksFiltersProps) {
    const {
        search,
        setSearch,
        statuses,
        toggleStatus,
        tags,
        selectedTags,
        toggleTag,
        minRating,
        setMinRating,
        sort,
        setSort,
        clearFilters,
        hasFilters,
    } = props;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Название или автор…"
                    className="h-9 pr-8 pl-9"
                />
                {search !== '' && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        aria-label="Очистить поиск"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-1.5">
                {BOOK_STATUS_ORDER.map((status) => {
                    const active = statuses.includes(status);

                    return (
                        <button
                            key={status}
                            type="button"
                            onClick={() => toggleStatus(status)}
                            aria-pressed={active}
                            className={cn(
                                'h-9 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors',
                                active
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-card/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            {BOOK_STATUS_LABELS[status]}
                        </button>
                    );
                })}
            </div>

            {tags.length > 0 && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 border-border bg-card/50 px-3 font-medium text-muted-foreground"
                        >
                            <Tag className="h-3.5 w-3.5" />
                            Теги
                            {selectedTags.length > 0 && (
                                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                                    {selectedTags.length}
                                </span>
                            )}
                            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-72 p-3">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Теги
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => {
                                const active = selectedTags.includes(tag);

                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        aria-pressed={active}
                                        className={cn(
                                            'h-7 rounded-full border px-2.5 text-xs font-medium transition-colors',
                                            active
                                                ? 'border-primary/40 bg-primary/10 text-primary'
                                                : 'border-border bg-card/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            <Select value={String(minRating)} onValueChange={(value) => setMinRating(Number(value))}>
                <SelectTrigger className="h-9 w-36 bg-card/50 text-muted-foreground">
                    <SelectValue placeholder="Рейтинг" />
                </SelectTrigger>
                <SelectContent>
                    {RATING_OPTIONS.map((rating) => (
                        <SelectItem key={rating} value={String(rating)}>
                            {rating === 0 ? 'Любой рейтинг' : `от ${rating} и выше`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-44 bg-card/50 text-muted-foreground">
                    <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                    {BOOKS_SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                    Сбросить
                </Button>
            )}
        </div>
    );
}
