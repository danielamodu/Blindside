/**
 * Blindside visual reminder: Liquid Obsidian uses glass for navigation and route context,
 * while transaction content remains on solid graphite surfaces for financial clarity.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Fund from "./pages/Fund";
import Home from "./pages/Home";
import Shield from "./pages/Shield";
import Trade from "./pages/Trade";
import Withdraw from "./pages/Withdraw";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app/shield" component={Shield} />
      <Route path="/app/fund" component={Fund} />
      <Route path="/app/trade" component={Trade} />
      <Route path="/app/withdraw" component={Withdraw} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
