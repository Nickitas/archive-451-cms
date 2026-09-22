'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLocale } from '@/shared/i18n/locale-provider';
import { PAGE_SIZES } from '../domain/book-filters';
import { booksCopy } from '../domain/i18n';

type PageNumberItem = { page: number } | { ellipsis: true; index: number };

export function getPageNumbers(page: number, totalPages: number): PageNumberItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => ({ page: index + 1 }));
    }

    const items: PageNumberItem[] = [{ page: 1 }, { page: 2 }, { page: 3 }];

    if (page > 4 && page < totalPages - 2) {
        items.push({ ellipsis: true, index: 3 });
        items.push({ page: page - 1 }, { page }, { page: page + 1 });
        items.push({ ellipsis: true, index: 7 });
    } else if (page <= 4) {
        items.push({ page: 4 }, { page: 5 }, { ellipsis: true, index: 6 });
    } else {
        items.push({ ellipsis: true, index: 3 });
        items.push({ page: totalPages - 2 }, { page: totalPages - 1 }, { page: totalPages });
    }

    return items;
}

type BooksPaginationProps = {
    page: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (value: string) => void;
};

export function BooksPagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: BooksPaginationProps) {
    const t = booksCopy[useLocale()];

    return (
        <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.pagination.pageSizePrefix}</span>

                <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
                    <SelectTrigger className="h-8 w-20 bg-card/50 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZES.map((option) => (
                            <SelectItem key={option} value={String(option)}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <span className="text-xs text-muted-foreground">{t.pagination.pageSizeSuffix}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                    {t.pagination.pageInfo(page, totalPages)}
                </span>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="rounded-full"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers(page, totalPages).map((item) =>
                        'ellipsis' in item ? (
                            <span key={'ellipsis-' + item.index} className="px-1 text-muted-foreground/60">
                                …
                            </span>
                        ) : (
                            <Button
                                key={item.page}
                                variant={page === item.page ? 'secondary' : 'ghost'}
                                size="icon-sm"
                                onClick={() => onPageChange(item.page)}
                                className="rounded-full text-xs"
                            >
                                {item.page}
                            </Button>
                        ),
                    )}

                    <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="rounded-full"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
