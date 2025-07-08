export default {
  editor: {
    label: {
      en: "RACQ Package Selection v2"
    },
    icon: "package",
    customStylePropertiesOrder: [],
    customSettingsPropertiesOrder: ["showPricing", "packagesData", "systemType", "energyTier", "recommendationData"]
  },
  
  properties: {
    showPricing: {
      label: {
        en: "Show Pricing"
      },
      type: "OnOff",
      bindable: true,
      defaultValue: false
    },
    
    packagesData: {
      label: {
        en: "Packages Data"
      },
      type: "Object",
      bindable: true,
      defaultValue: []
    },
    
    systemType: {
      label: {
        en: "System Type"
      },
      type: "Text",
      bindable: true,
      defaultValue: ""
    },
    
    energyTier: {
      label: {
        en: "Energy Tier"
      },
      type: "Text",
      bindable: true,
      defaultValue: ""
    },
    
    recommendationData: {
      label: {
        en: "Recommendation Data"
      },
      type: "Object",
      bindable: true,
      defaultValue: null
    }
  },
  
  triggerEvents: [
    {
      name: "onGeneratePackages",
      label: { en: "On Generate Packages" },
      event: {
        timestamp: "",
        formData: {}
      },
      default: false
    },
    {
      name: "packages:generated",
      label: { en: "Packages Generated" },
      event: {
        systemType: "",
        energyTier: "",
        packagesShown: 0
      },
      default: false
    },
    {
      name: "package:selected",
      label: { en: "Package Selected" },
      event: {
        packageId: "",
        packageName: "",
        packageTier: "",
        systemType: "",
        systemSize: "",
        basePrice: 0,
        tagline: "",
        components: [],
        timestamp: ""
      },
      default: true
    },
    {
      name: "packages:refresh",
      label: { en: "Packages Refresh" },
      event: {
        systemType: "",
        timestamp: ""
      },
      default: false
    },
    {
      name: "packages:closed",
      label: { en: "Packages Closed" },
      event: {
        selectedPackage: "",
        timestamp: ""
      },
      default: false
    },
    {
      name: "salesCoach:open",
      label: { en: "Sales Coach Open" },
      event: {
        package: {},
        recommendation: {},
        customerProfile: {},
        timestamp: ""
      },
      default: false
    }
  ]
}