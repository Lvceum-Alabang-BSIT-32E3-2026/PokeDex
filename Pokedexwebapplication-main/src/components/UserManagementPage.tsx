import { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    TablePagination,
    Button,
    Select,
    MenuItem,
} from "@mui/material";
import { toast, Toaster } from "react-hot-toast"; // feedback notifications

interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users", { credentials: "include" });
                if (!response.ok) throw new Error("Failed to fetch users");
                const data = await response.json();
                setUsers(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Confirmation dialog
        const confirmChange = window.confirm(
            `Are you sure you want to change ${user.username}'s role to ${newRole}?`
        );
        if (!confirmChange) return;

        try {
            const response = await fetch(`/api/users/${userId}/roles`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) throw new Error("Failed to update role");

            setUsers(prev =>
                prev.map(u => (u.id === userId ? { ...u, roles: [newRole] } : u))
            );

            toast.success(`${user.username}'s role updated to ${newRole}`);
        } catch {
            toast.error(`Failed to update ${user.username}'s role`);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`Are you sure you want to delete ${user.username}?`)) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to delete user");

            setUsers(prev => prev.filter(u => u.id !== userId));
            toast.success(`${user.username} deleted`);
        } catch {
            toast.error(`Failed to delete ${user.username}`);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <Toaster position="top-right" />
            <h1>User Management</h1>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Roles</TableCell>
                            <TableCell>Manage Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.roles.join(", ")}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.roles[0]}
                                            onChange={(e) =>
                                                handleRoleChange(user.id, e.target.value)
                                            }
                                            size="small"
                                        >
                                            <MenuItem value="User">User</MenuItem>
                                            <MenuItem value="Admin">Admin</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={users.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </TableContainer>
        </div>
    );
}