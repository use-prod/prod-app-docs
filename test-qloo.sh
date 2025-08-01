#!/bin/bash

# Qloo Integration Test Script
# Simple bash wrapper for testing Qloo features

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
QLOO_API_KEY=${QLOO_API_KEY:-""}
NODE_ENV=${NODE_ENV:-"development"}

print_header() {
    echo -e "\n${CYAN}===============================================${NC}"
    echo -e "${CYAN}🎯 $1${NC}"
    echo -e "${CYAN}===============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    # Check if TypeScript is available
    if ! command -v npx &> /dev/null; then
        print_error "npx not available"
        exit 1
    fi
    print_success "npx available for TypeScript execution"

    # Check for Qloo API key
    if [ -z "$QLOO_API_KEY" ]; then
        print_warning "QLOO_API_KEY environment variable not set"
        print_info "Set it with: export QLOO_API_KEY=your_hackathon_key"
    else
        print_success "QLOO_API_KEY is set"
    fi

    # Check if test file exists
    if [ ! -f "src/test-qloo.ts" ]; then
        print_error "Test file src/test-qloo.ts not found"
        exit 1
    fi
    print_success "Test file found"
}

run_test() {
    local test_command="$1"
    shift
    local args="$@"
    
    print_info "Running: $test_command $args"
    
    # Set environment variables
    export QLOO_API_KEY="$QLOO_API_KEY"
    export NODE_ENV="$NODE_ENV"
    
    # Run the TypeScript file with ts-node or compiled version
    if command -v ts-node &> /dev/null; then
        ts-node src/test-qloo.ts "$test_command" $args
    else
        # Fallback to npx ts-node
        npx ts-node src/test-qloo.ts "$test_command" $args
    fi
}

show_help() {
    print_header "Qloo Integration Test Script"
    
    echo -e "${BLUE}Usage:${NC}"
    echo "  ./test-qloo.sh [command] [options]"
    echo ""
    
    echo -e "${BLUE}Commands:${NC}"
    echo "  basic-api          - Test basic Qloo API connectivity"
    echo "  goal-architect     - Test Cultural Goal Architect"
    echo "  smart-components   - Test Smart Project Component Generation"
    echo "  cross-domain       - Test Cross-Domain Discovery Engine"
    echo "  full-demo          - Run complete demo scenario"
    echo "  interactive        - Interactive testing mode"
    echo "  all               - Run all tests sequentially"
    echo ""
    
    echo -e "${BLUE}Options for goal-architect:${NC}"
    echo "  -g, --goal <goal>           Goal to enhance (default: 'I want to get healthier')"
    echo "  -i, --interests <list>      Comma-separated interests (default: 'indie music,coffee,hiking')"
    echo "  -l, --location <location>   User location"
    echo "  -a, --age <range>          Age range (25_to_35, 30_to_40, etc.)"
    echo ""
    
    echo -e "${BLUE}Options for smart-components:${NC}"
    echo "  -p, --project-type <type>   Project type (default: 'fitness_journey')"
    echo "  -i, --interests <list>      Comma-separated interests"
    echo "  -l, --location <location>   User location"
    echo ""
    
    echo -e "${BLUE}Options for cross-domain:${NC}"
    echo "  -i, --interests <list>      Comma-separated interests"
    echo "  -d, --domain <domain>       Target domain (business, fitness, creative, etc.)"
    echo "  -l, --location <location>   User location"
    echo ""
    
    echo -e "${BLUE}Options for full-demo:${NC}"
    echo "  -s, --scenario <number>     Demo scenario (1-3, default: 1)"
    echo "  -l, --location <location>   Override location"
    echo ""
    
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./test-qloo.sh basic-api"
    echo "  ./test-qloo.sh goal-architect --goal 'start a business' --interests 'tech,coffee,community'"
    echo "  ./test-qloo.sh smart-components --project-type 'business_launch' --location 'Austin, TX'"
    echo "  ./test-qloo.sh cross-domain --interests 'music,food,design' --domain 'business'"
    echo "  ./test-qloo.sh full-demo --scenario 2"
    echo "  ./test-qloo.sh interactive"
    echo ""
    
    echo -e "${BLUE}Environment Variables:${NC}"
    echo "  QLOO_API_KEY    - Your Qloo hackathon API key (required)"
    echo "  NODE_ENV        - Environment (default: development)"
    echo ""
    
    echo -e "${YELLOW}Demo Scenarios:${NC}"
    echo "  1. Fitness Enthusiast (indie music, coffee, hiking) in Brooklyn, NY"
    echo "  2. Aspiring Entrepreneur (craft beer, sustainability, tech) in Austin, TX"
    echo "  3. Creative Professional (Japanese design, vinyl, films) in San Francisco, CA"
}

run_all_tests() {
    print_header "Running All Qloo Tests"
    
    print_info "Test 1/5: Basic API Connectivity"
    run_test "basic-api"
    echo ""
    
    print_info "Test 2/5: Cultural Goal Architect"
    run_test "goal-architect" --goal "I want to get into better shape" --interests "indie music,specialty coffee,hiking"
    echo ""
    
    print_info "Test 3/5: Smart Project Components"
    run_test "smart-components" --project-type "fitness_journey" --interests "yoga,mindfulness,healthy_food"
    echo ""
    
    print_info "Test 4/5: Cross-Domain Discovery"
    run_test "cross-domain" --interests "coffee,music,design" --domain "fitness"
    echo ""
    
    print_info "Test 5/5: Full Demo"
    run_test "full-demo" --scenario 1
    echo ""
    
    print_success "All tests completed!"
}

quick_demo() {
    print_header "Quick Qloo Demo"
    
    print_info "Running a quick demo to showcase key features..."
    
    # Quick API test first
    print_info "Testing API connectivity..."
    if run_test "basic-api" > /dev/null 2>&1; then
        print_success "API connectivity confirmed"
    else
        print_error "API connectivity failed - check your QLOO_API_KEY"
        return 1
    fi
    
    # Run one example from each category
    print_info "Demo 1: Cultural Goal Enhancement"
    run_test "goal-architect" --goal "I want to be more creative" --interests "indie music,art galleries,coffee shops" --location "Brooklyn, NY"
    
    echo -e "\n${CYAN}Press Enter to continue to next demo...${NC}"
    read
    
    print_info "Demo 2: Smart Components"
    run_test "smart-components" --project-type "creative_project" --interests "art,music,design" --location "Brooklyn, NY"
    
    echo -e "\n${CYAN}Press Enter to continue to final demo...${NC}"
    read
    
    print_info "Demo 3: Cross-Domain Discovery"
    run_test "cross-domain" --interests "indie music,art galleries,specialty coffee" --domain "creative" --location "Brooklyn, NY"
    
    print_success "Quick demo completed!"
}

# Main script logic
case "$1" in
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    "check"|"prerequisites")
        check_prerequisites
        ;;
    "all")
        check_prerequisites
        run_all_tests
        ;;
    "quick"|"demo")
        check_prerequisites
        quick_demo
        ;;
    "basic-api"|"goal-architect"|"smart-components"|"cross-domain"|"full-demo"|"interactive")
        check_prerequisites
        run_test "$@"
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac