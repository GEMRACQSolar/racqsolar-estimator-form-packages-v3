<template>
  <div class="packages-form">
    <!-- Section with Accordion Style -->
    <div class="section-container">
      <div class="section-header" @click="toggleSection">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h5 class="section-title">Package Selection</h5>
        </div>
        <svg class="chevron" :class="{ rotated: !isExpanded }" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <div v-if="isExpanded" class="section-content">
        <!-- Sub-header inside the accordion -->
        <div class="sub-header">
          <p class="sub-header-text">Click below to generate tailored package options</p>
        </div>

        <!-- Package Selection Content -->
        <div v-if="!showPackages" class="selection-prompt">
          <div class="disclaimer-text">
            <p>Packages are indicative only - automatically matched to the selected system type and estimated energy usage.</p>
            <p>These options provide a starting point and are not a finalised solar system proposal. If the customer accepts an indicative package, 
            an RACQ Solar team member will review the details and if required, contact them before issuing a formal proposal.</p>
          </div>
          <button class="generate-button" @click="generatePackages">
            Generate Package Options
          </button>
        </div>

        <!-- Package Cards Grid or Empty State -->
        <div v-if="showPackages" class="packages-display">
          <!-- Show packages if available -->
          <div v-if="displayPackages.length > 0">
            <!-- Packages Grid - Horizontal Layout -->
            <div class="packages-grid-horizontal">
              <div
                v-for="(pkg, index) in displayPackages"
                :key="pkg.id || index"
                class="package-card-horizontal"
                :class="[`tier-${index + 1}`, { selected: selectedPackage === pkg.id }]"
                @click="selectPackage(pkg)"
              >
                <!-- Package Header with Tier -->
                <div class="package-header-horizontal">
                  <!-- RECOMMENDATION BADGE -->
                  <div v-if="getRecommendationBadge(pkg)" class="recommendation-badge-horizontal">
                    {{ getRecommendationBadge(pkg) }}
                  </div>
                  
                  <!-- Tier Badge -->
                  <div class="tier-indicator" :class="`tier-${index + 1}-color`">
                    {{ getTierName(pkg, index) }}
                  </div>
                  
                  <!-- System Name and Size -->
                  <h3 class="package-system-name">{{ formatSystemSize(pkg.system_size_kw) }} {{ getSystemTypeLabel(pkg.system_type) }}</h3>
                  <p class="package-tagline">{{ pkg.tagline }}</p>
                </div>

                <!-- Components Section - Simplified -->
                <div class="components-section">
                  <h4 class="components-title">Included Components</h4>
                  <div class="components-list">
                    <!-- Group and display components cleanly -->
                    <div v-for="(group, idx) in groupedComponents(pkg.components)" :key="`${pkg.id}-group-${idx}`">
                      <div v-for="(component, cidx) in group.components" :key="`${pkg.id}-comp-${cidx}`" class="component-line">
                        <span class="component-quantity" v-if="component.quantity > 1">{{ component.quantity }}x</span>
                        <span class="component-quantity" v-else>1x</span>
                        <span class="component-name">{{ component.manufacturer }} {{ component.model }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pricing Section (if enabled) -->
                <div v-if="content.showPricing && pkg.base_price" class="pricing-section-horizontal">
                  <span class="price-label">Indicative Investment</span>
                  <span class="price-value">{{ formatPrice(pkg.base_price) }}</span>
                </div>

                <!-- Selection Button -->
                <button 
                  class="select-button-horizontal"
                  :class="{ selected: selectedPackage === pkg.id }"
                >
                  {{ selectedPackage === pkg.id ? 'Selected' : 'Select This Package' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty state when no packages match -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="empty-title">No Packages Available</h3>
            <p class="empty-message">
              {{ getEmptyMessage() }}
            </p>
            <p class="empty-submessage">
              Please contact our solar specialists for a custom solution tailored to your needs.
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div class="action-buttons-wrapper">
            <button 
              v-if="displayPackages.length > 0 && hasRecommendedPackage()" 
              class="sales-coach-button" 
              @click="openSalesCoach"
            >
              Share data with Sales Coach
            </button>
            <button class="refresh-button" @click="refreshPackages">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Refresh Packages
            </button>
            <button class="close-button" @click="closePackages">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Close Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
 * RACQ Solar Package Selection Component - Improved UX Version
 * 
 * This component displays solar package options with intelligent recommendations.
 * 
 * v37 Deployment - July 7, 2025
 * 
 * CHANGES IN THIS VERSION:
 * - Horizontal layout for better comparison
 * - Removed hardware icons for cleaner look
 * - Simplified component display to match quote format
 * - Improved visual hierarchy
 * - All existing functionality preserved
 * 
 * RECOMMENDATION FEATURE (Added June 2025):
 * - Receives recommendation data from WeWeb workflow that calls Supabase function
 * - Displays "HIGHLY RECOMMENDED" or "RECOMMENDED" badge on matching packages
 * - Helps sales staff guide customers to the most suitable package
 * - Based on comprehensive analysis of customer inputs (usage, bill, future plans, etc.)
 * 
 * SALES COACH FEATURE (Added July 2025):
 * - Added Sales Coach button to help staff explain recommendations
 * - Button appears only when there's a recommended package
 * - Passes package details and recommendation reason to Edge Function
 * 
 * TRIGGER EVENTS:
 * - onGeneratePackages: Fired when "Generate Package Options" button is clicked
 *   This allows WeWeb to trigger the recommendation workflow
 * - salesCoach:open: Fired when "Sales Coach" button is clicked
 *   Passes recommended package and reason to Edge Function
 * 
 * For implementation details, see:
 * https://github.com/GEMRACQSolar/racqsolar-documentation/tree/main/recommendation-system
 */
export default {
  name: 'RACQPackageSelection',
  
  props: {
    content: {
      type: Object,
      default: () => ({
        showPricing: false,
        packagesData: [],
        systemType: '',
        energyTier: '',
        recommendationData: null
      })
    }
  },
  
  data() {
    return {
      isExpanded: false,
      showPackages: false,
      selectedPackage: null,
      selectedPackageDetails: null,
      displayPackages: []
    }
  },
  
  mounted() {
    // Make package data accessible globally for WeWeb
    window.racqPackageData = {
      selectedPackage: this.selectedPackage,
      packageDetails: this.selectedPackageDetails
    }
    
    // Listen for quote generated event to close accordion
    window.addEventListener('racq-quote-generated', this.handleQuoteGenerated)
  },
  
  beforeDestroy() {
    // Clean up event listener
    window.removeEventListener('racq-quote-generated', this.handleQuoteGenerated)
  },
  
  methods: {
    toggleSection() {
      this.isExpanded = !this.isExpanded
    },
    
    handleQuoteGenerated() {
      // Close accordion when quote is generated
      this.isExpanded = false
      // Also close packages display if open
      this.showPackages = false
    },
    
    generatePackages() {
      console.log('Generate packages clicked')
      
      // Emit event for WeWeb workflow to trigger recommendation system
      this.$emit('trigger-event', {
        name: 'onGeneratePackages',
        event: {
          timestamp: new Date().toISOString(),
          formData: {
            personalData: window.racqPersonalData || {},
            energyData: window.racqEnergyData || {},
            houseData: window.racqHouseData || {},
            systemType: this.content.systemType,
            energyTier: this.content.energyTier
          }
        }
      })
      
      // Extract packages array from content
      let packagesArray = []
      
      if (this.content.packagesData) {
        if (Array.isArray(this.content.packagesData)) {
          packagesArray = this.content.packagesData
        } else if (this.content.packagesData.data && Array.isArray(this.content.packagesData.data)) {
          packagesArray = this.content.packagesData.data
        } else if (typeof this.content.packagesData === 'object') {
          const keys = Object.keys(this.content.packagesData)
          if (keys.every(key => !isNaN(key))) {
            packagesArray = Object.values(this.content.packagesData)
          }
        }
      }
      
      if (packagesArray.length > 0) {
        this.displayPackages = packagesArray.slice(0, 3)
      } else {
        this.displayPackages = []
      }
      
      this.showPackages = true
      
      this.$emit('trigger-event', {
        name: 'packages:generated',
        event: {
          systemType: this.content.systemType,
          energyTier: this.content.energyTier,
          packagesShown: this.displayPackages.length
        }
      })
    },
    
    refreshPackages() {
      this.$emit('trigger-event', {
        name: 'packages:refresh',
        event: {
          systemType: this.content.systemType,
          timestamp: new Date().toISOString()
        }
      })
      
      this.generatePackages()
    },
    
    selectPackage(pkg) {
      this.selectedPackage = pkg.id
      
      const packageDetails = {
        packageId: pkg.id,
        packageName: pkg.name,
        packageTier: pkg.tier || pkg.display_name,
        systemType: pkg.system_type,
        systemSize: pkg.system_size_kw,
        basePrice: pkg.base_price,
        tagline: pkg.tagline,
        components: pkg.components,
        timestamp: new Date().toISOString()
      }
      
      this.selectedPackageDetails = packageDetails
      
      // Update global reference
      window.racqPackageData = {
        selectedPackage: this.selectedPackage,
        packageDetails: packageDetails
      }
      
      this.$emit('trigger-event', {
        name: 'package:selected',
        event: packageDetails
      })
    },
    
    closePackages() {
      this.showPackages = false
      this.$emit('trigger-event', {
        name: 'packages:closed',
        event: {
          selectedPackage: this.selectedPackage,
          timestamp: new Date().toISOString()
        }
      })
    },
    
    getRecommendationBadge(pkg) {
      if (!this.content.recommendationData) return null
      
      const rec = this.content.recommendationData
      
      const packageMatchesRecommendation = 
        pkg.system_type === rec.package_type &&
        (pkg.tier?.toLowerCase() === rec.system_size?.toLowerCase() ||
         pkg.display_name?.toLowerCase() === rec.system_size?.toLowerCase())
      
      if (!packageMatchesRecommendation) return null
      
      if (rec.recommendation_strength === 'strong') {
        return 'HIGHLY RECOMMENDED'
      } else if (rec.recommendation_strength === 'moderate') {
        return 'RECOMMENDED'
      }
      
      return null
    },
    
    hasRecommendedPackage() {
      if (!this.content.recommendationData || !this.displayPackages.length) return false
      return this.displayPackages.some(pkg => this.getRecommendationBadge(pkg) !== null)
    },
    
    getRecommendedPackage() {
      if (!this.content.recommendationData || !this.displayPackages.length) return null
      return this.displayPackages.find(pkg => this.getRecommendationBadge(pkg) !== null)
    },
    
    openSalesCoach() {
      const recommendedPackage = this.getRecommendedPackage()
      
      if (!recommendedPackage || !this.content.recommendationData) {
        console.error('No recommended package or recommendation data available')
        return
      }
      
      const salesCoachData = {
        package: {
          id: recommendedPackage.id,
          name: recommendedPackage.name,
          tier: recommendedPackage.tier || recommendedPackage.display_name,
          systemType: recommendedPackage.system_type,
          systemSize: recommendedPackage.system_size_kw,
          basePrice: recommendedPackage.base_price,
          tagline: recommendedPackage.tagline,
          components: recommendedPackage.components
        },
        recommendation: {
          reason: this.content.recommendationData.recommendation_reason || '',
          strength: this.content.recommendationData.recommendation_strength,
          packageType: this.content.recommendationData.package_type,
          systemSize: this.content.recommendationData.system_size,
          fullData: this.content.recommendationData
        },
        customerProfile: {
          personalData: window.racqPersonalData || {},
          energyData: window.racqEnergyData || {},
          houseData: window.racqHouseData || {},
          systemType: this.content.systemType,
          energyTier: this.content.energyTier
        },
        timestamp: new Date().toISOString()
      }
      
      console.log('Opening Sales Coach with data:', salesCoachData)
      
      this.$emit('trigger-event', {
        name: 'salesCoach:open',
        event: salesCoachData
      })
    },
    
    groupedComponents(components) {
      if (!components || components.length === 0) return []
      
      // Group components by type
      const grouped = components.reduce((acc, component) => {
        const type = component.component_type
        if (!acc[type]) {
          acc[type] = {
            type,
            components: []
          }
        }
        acc[type].components.push(component)
        return acc
      }, {})
      
      // Convert to array and sort by type order
      const typeOrder = ['panel', 'inverter', 'battery', 'other']
      return Object.values(grouped).sort((a, b) => {
        return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
      })
    },
    
    getTierName(pkg, index) {
      const tierNames = ['Silver', 'Gold', 'Platinum']
      return pkg.tier || tierNames[index] || 'Standard'
    },
    
    hasRacking(pkg) {
      // Check if system has panels (not battery only)
      return pkg.system_type !== 'battery_only' && 
             pkg.components && 
             pkg.components.some(c => c.component_type === 'panel')
    },
    
    getRackingQuantity(pkg) {
      // Get panel count for racking quantity
      const panelComponent = pkg.components.find(c => c.component_type === 'panel')
      return panelComponent ? panelComponent.quantity : 0
    },
    
    getSystemTypeLabel(systemType) {
      const labels = {
        'pv_only': 'Solar PV System',
        'pv_battery': 'Solar & Battery System',
        'battery_only': 'Battery Storage System',
        'ev_charger': 'EV Charging System'
      }
      return labels[systemType] || 'Energy System'
    },
    
    formatSystemSize(size) {
      if (!size) return ''
      return `${size}kW`
    },
    
    formatPrice(price) {
      if (!price) return 'Contact for pricing'
      // Format with comma separator and dollar sign
      const formatted = price.toLocaleString('en-AU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      return `$${formatted}`
    },
    
    getEmptyMessage() {
      if (this.content.systemType) {
        const systemLabel = this.getSystemTypeLabel(this.content.systemType)
        return `No packages are currently available for ${systemLabel} configurations.`
      }
      return 'No packages are currently available for the selected system type.'
    }
  }
}
</script>

<style scoped>
/* Container */
.packages-form {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Section Container */
.section-container {
  background: #001e45;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 28px;
  height: 28px;
  background: #FFE600;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 230, 0, 0.2);
}

.header-icon svg {
  width: 16px;
  height: 16px;
  color: #001f3f;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
  opacity: 0.85;
}

.chevron {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* Section Content */
.section-content {
  padding: 0 1.5rem 1.5rem;
  animation: slideDown 0.3s ease;
}

/* Sub Header */
.sub-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sub-header-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
}

/* Selection Prompt */
.selection-prompt {
  text-align: center;
}

.disclaimer-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.disclaimer-text p {
  margin: 0 0 0.75rem 0;
}

.disclaimer-text p:last-child {
  margin-bottom: 0;
}

.generate-button {
  background: #FFE600;
  color: #001f3f;
  border: none;
  border-radius: 6px;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 230, 0, 0.3);
}

.generate-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 230, 0, 0.4);
}

/* Packages Display */
.packages-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* NEW: Horizontal Grid Layout */
.packages-grid-horizontal {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* NEW: Horizontal Package Card - UPDATED with more top padding */
.package-card-horizontal {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 2.5rem 1.75rem 1.75rem; /* Increased top padding from 1.75rem to 2.5rem */
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.package-card-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.package-card-horizontal.selected {
  border-color: #FFE600;
  box-shadow: 0 0 0 3px rgba(255, 230, 0, 0.2);
}

/* NEW: Package Header for Horizontal Layout */
.package-header-horizontal {
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* NEW: Tier Indicator */
.tier-indicator {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

/* UPDATED: Proper metallic colors for tiers */
.tier-1-color {
  background: linear-gradient(135deg, #C0C0C0 0%, #B8B8B8 50%, #D3D3D3 100%);
  color: #1a1a1a;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.2);
}

.tier-2-color {
  background: linear-gradient(135deg, #FFD700 0%, #FFED4E 50%, #FFA500 100%);
  color: #1a1a1a;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.2);
}

.tier-3-color {
  background: linear-gradient(135deg, #E5E4E2 0%, #BDB9AD 50%, #E5E4E2 100%);
  color: #1a1a1a;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.2);
}

/* NEW: Package System Name */
.package-system-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.package-tagline {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
}

/* UPDATED: Recommendation Badge - July 8, 2025 11:20 AM Brisbane */
.recommendation-badge-horizontal {
  position: absolute;
  top: -20px; /* Adjusted from -12px to ensure it doesn't get cut off */
  left: 50%;
  transform: translateX(-50%);
  background: #FFE600;
  color: #001e45;
  padding: 14px 32px; /* UPDATED: Increased from 5px 14px to 10px 24px for better spacing */
  border-radius: 26px; /* UPDATED: Increased from 24px to 26px */
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 12px rgba(255, 230, 0, 0.5);
  z-index: 10;
  white-space: nowrap;
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    box-shadow: 0 2px 12px rgba(255, 230, 0, 0.5);
  }
  50% {
    box-shadow: 0 2px 20px rgba(255, 230, 0, 0.7);
  }
}

/* NEW: Components Section */
.components-section {
  flex: 1;
  margin-bottom: 1.25rem;
}

.components-title {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.components-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.component-line {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.component-quantity {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  min-width: 24px;
}

.component-name {
  color: #FFFFFF;
  flex: 1;
}

/* NEW: Pricing Section for Horizontal Layout */
.pricing-section-horizontal {
  background: rgba(255, 230, 0, 0.1);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.25rem;
  text-align: center;
}

.price-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFE600;
  line-height: 1;
}

/* NEW: Selection Button for Horizontal Layout */
.select-button-horizontal {
  width: 100%;
  background: #FFE600;
  color: #001f3f;
  border: none;
  border-radius: 6px;
  padding: 0.875rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  margin-top: auto;
  box-shadow: 0 2px 8px rgba(255, 230, 0, 0.3);
}

.select-button-horizontal:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 230, 0, 0.4);
}

.select-button-horizontal.selected {
  background: #92C467;
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(146, 196, 103, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon svg {
  color: rgba(255, 255, 255, 0.4);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.75rem;
}

.empty-message {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-submessage {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Action Buttons */
.action-buttons-wrapper {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

/* Sales Coach Button */
.sales-coach-button {
  background: #6BB6FF;
  border: none;
  color: #003478;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(107, 182, 255, 0.4);
  min-width: 140px;
  justify-content: center;
}

.sales-coach-button:hover {
  background: #5CA5EE;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 182, 255, 0.5);
}

/* Refresh button */
.refresh-button {
  background: #003478;
  border: 1px solid #003478;
  color: #FFFFFF;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 52, 120, 0.3);
  min-width: 140px;
  justify-content: center;
}

.refresh-button:hover {
  background: #002456;
  border-color: #002456;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 52, 120, 0.4);
}

/* Close button */
.close-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  color: #FFFFFF;
}

.refresh-button svg,
.close-button svg {
  width: 16px;
  height: 16px;
}

/* Animation */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .packages-grid-horizontal {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .packages-grid-horizontal {
    grid-template-columns: 1fr;
  }
  
  .packages-form {
    padding: 1.5rem 0.75rem;
  }
  
  .section-header {
    padding: 1rem 1.25rem;
  }
  
  .section-content {
    padding: 0 1.25rem 1.25rem;
  }
  
  .action-buttons-wrapper {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .refresh-button,
  .close-button,
  .sales-coach-button {
    width: 100%;
    justify-content: center;
    min-width: unset;
  }
  
  .recommendation-badge-horizontal {
    font-size: 0.5625rem;
    padding: 8px 20px; /* UPDATED: Proportionally reduced for mobile but still generous */
  }
  
  /* Ensure adequate padding on mobile too */
  .package-card-horizontal {
    padding-top: 2.25rem; /* Slightly less on mobile but still enough room */
  }
}
</style>