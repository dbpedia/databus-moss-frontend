<script lang="ts">
    import { Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Checkbox,
        TableSearch,
        Input,
		Button,
    } from 'flowbite-svelte';
    import { ClipboardCheckOutline } from "flowbite-svelte-icons";
</script>

<TableBodyRow>
    <TableBodyCell>
        <Input placeholder="API Key Name"/>
    </TableBodyCell>
    <TableBodyCell>
            <Button>Add</Button>
    </TableBodyCell>
</TableBodyRow>

<style>
</style>