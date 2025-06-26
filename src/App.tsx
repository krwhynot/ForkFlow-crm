import { CRM } from './root/CRM';

/**
 * ForkFlow Food Broker CRM Application Entry Point
 *
 * Customize ForkFlow CRM by passing props to the CRM component:
 *  - businessTypes: Types of food businesses (restaurant, grocery, etc.)
 *  - visitTypes: Types of visits brokers can log
 *  - reminderPriorities: Priority levels for reminders
 *  - enableGPS: Enable GPS location features for mobile brokers
 *  - lightTheme/darkTheme: UI themes
 *  - logo: Company logo
 *  - title: Application title
 * ... as well as all the props accepted by react-admin's <Admin> component.
 *
 * @example
 * const App = () => (
 *    <CRM
 *       logo="./img/forkflow-logo.png"
 *       title="ForkFlow Food Broker CRM"
 *       enableGPS={true}
 *    />
 * );
 */
const App = () => <CRM title="ForkFlow Food Broker CRM" enableGPS={true} />;

export default App;
