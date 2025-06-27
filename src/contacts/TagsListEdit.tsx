import ControlPointIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, Menu, MenuItem } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import {
    Identifier,
    useGetList,
    useGetMany,
    useRecordContext,
    useUpdate
} from 'react-admin';

import { TagChip } from '../tags/TagChip';
import { TagCreateModal } from '../tags/TagCreateModal';
import { Contact, Tag } from '../types';

export const TagsListEdit = () => {
    const record = useRecordContext<Contact>();
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const { data: allTags, isPending: isPendingAllTags } = useGetList<Tag>(
        'tags',
        {
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'name', order: 'ASC' },
        }
    );
    const tagsArray = record?.tags ?? [];
    const unselectedTags =
        allTags &&
        record &&
        allTags.filter(tag => !(tagsArray as string[]).includes(tag.id.toString()));
    const [update] = useUpdate<Contact>();

    const { data: tags = [], isPending: isPendingRecordTags = false } = useGetMany<Tag>(
        'tags',
        { ids: tagsArray },
        { enabled: record && tagsArray.length > 0 }
    );

    const handleMenuOpen = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTagAdd = (id: Identifier) => {
        if (!record) {
            throw new Error('No contact record found');
        }
        const tags = [...(record.tags ?? []), id.toString()];
        update('contacts', {
            id: record.id,
            data: { tags },
            previousData: record,
        });
        setAnchorEl(null);
    };

    const handleTagRemove = async (id: Identifier) => {
        if (!record) {
            throw new Error('No contact record found');
        }
        const tags = (record.tags ?? []).filter(tagId => tagId !== id.toString());
        await update('contacts', {
            id: record.id,
            data: { tags },
            previousData: record,
        });
        setAnchorEl(null);
    };

    const openTagCreateDialog = () => {
        setOpen(true);
        setAnchorEl(null);
    };

    const handleTagCreateClose = () => {
        setOpen(false);
    };

    const handleTagCreated = React.useCallback(
        async (tag: Tag) => {
            if (!record) {
                throw new Error('No contact record found');
            }

            await update(
                'contacts',
                {
                    id: record.id,
                    data: { tags: [...tagsArray, tag.id.toString()] },
                    previousData: record,
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                    },
                }
            );
        },
        [update, record, tagsArray]
    );

    if (isPendingRecordTags || isPendingAllTags) return null;
    const tagList = tags;
    return (
        <>
            {tagList.map((tag: Tag) => (
                <Box mt={1} mb={1} key={tag.id}>
                    <TagChip
                        tag={tag}
                        onUnlink={() => handleTagRemove(tag.id)}
                        key={tag.id}
                    />
                </Box>
            ))}
            <Box mt={1}>
                <Chip
                    icon={<ControlPointIcon />}
                    size="small"
                    variant="outlined"
                    onClick={handleMenuOpen}
                    label="Add tag"
                    color="primary"
                />
            </Box>
            <Menu
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorEl={anchorEl}
            >
                {unselectedTags?.map(tag => (
                    <MenuItem key={tag.id} onClick={() => handleTagAdd(tag.id)}>
                        <Chip
                            size="small"
                            variant="outlined"
                            label={tag.name}
                            style={{
                                backgroundColor: tag.color,
                                border: 0,
                            }}
                            onClick={() => handleTagAdd(tag.id)}
                        />
                    </MenuItem>
                ))}
                <MenuItem onClick={openTagCreateDialog}>
                    <Chip
                        icon={<EditIcon />}
                        size="small"
                        variant="outlined"
                        onClick={openTagCreateDialog}
                        color="primary"
                        label="Create new tag"
                    />
                </MenuItem>
            </Menu>
            <TagCreateModal
                open={open}
                onClose={handleTagCreateClose}
                onSuccess={handleTagCreated}
            />
        </>
    );
};
