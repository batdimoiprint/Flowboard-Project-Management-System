import { Card } from '@fluentui/react-components'
import MyTasksDataGrid from './MyTasksDataGrid'
import { useMyTasksCardStyles } from '../styles/Styles';

export default function MyTasks() {
    const cardStyles = useMyTasksCardStyles();
    return (

        <>
            <Card className={cardStyles.root}>

                <MyTasksDataGrid />
            </Card>
        </>
    )
}
