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
        <Input placeholder="Username"/>
    </TableBodyCell>
    <TableBodyCell>
        <Input placeholder="User Sub"/>
    </TableBodyCell>
    <TableBodyCell>
        <Input disabled placeholder="Generated API Key"/>
    </TableBodyCell>
    <TableBodyCell>
            <Button>Add</Button>
    </TableBodyCell>
</TableBodyRow>

<style>
</style>