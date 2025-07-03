import { Card, CardContent, CardActions, Skeleton } from '@mui/material';

export const LoginSkeleton = () => (
    <Card sx={{ width: 300 }}>
        <CardContent>
            <Skeleton variant="text" width={240} height={40} />
            <Skeleton variant="text" width={240} height={40} />
        </CardContent>
        <CardActions>
            <Skeleton variant="rectangular" width={240} height={40} />
        </CardActions>
    </Card>
);
