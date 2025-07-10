package com.ddfinance.core.domain.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Enumeration of investment types available in the US stock market.
 * Represents different categories of financial instruments.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Getter
public enum InvestmentType {

    /**
     * Individual company shares traded on stock exchanges
     */
    STOCK("STK", "Stock", "Individual company shares traded on NYSE, NASDAQ, etc.", true, true, true),

    /**
     * Exchange-Traded Funds
     */
    ETF("ETF", "Exchange-Traded Fund", "A basket of securities that trades like a stock", true, true, true),

    /**
     * Mutual Funds
     */
    MUTUAL_FUND("MF", "Mutual Fund", "Pooled investment managed by professionals", true, true, true),

    /**
     * Corporate or government bonds
     */
    BOND("BND", "Bond", "Fixed income securities with regular interest payments", true, false, false),

    /**
     * Real Estate Investment Trusts
     */
    REIT("REIT", "Real Estate Investment Trust", "Companies that own or finance income-producing real estate", true, true, true),

    /**
     * Other investment types
     */
    OTHER("OTH", "Other Investment", "Alternative investments not categorized above", false, false, false);

    private final String code;
    private final String displayName;
    private final String description;
    private final boolean tradable;
    private final boolean canPayDividends;
    private final boolean supportsFractionalShares;

    /**
     * Constructor for InvestmentType enum.
     *
     * @param code Short code for the investment type
     * @param displayName Human-readable name
     * @param description Detailed description
     * @param tradable Whether this type can be traded on exchanges
     * @param canPayDividends Whether this type can pay dividends
     * @param supportsFractionalShares Whether fractional shares are supported
     */
    InvestmentType(String code, String displayName, String description,
                   boolean tradable, boolean canPayDividends, boolean supportsFractionalShares) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
        this.tradable = tradable;
        this.canPayDividends = canPayDividends;
        this.supportsFractionalShares = supportsFractionalShares;
    }

    /**
     * Finds an investment type by its code.
     *
     * @param code The investment type code
     * @return The matching InvestmentType, or null if not found
     */
    public static InvestmentType fromCode(String code) {
        if (code == null || code.isEmpty()) {
            return null;
        }

        for (InvestmentType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        return null;
    }

    /**
     * Gets all tradable investment types.
     *
     * @return List of tradable investment types
     */
    public static List<InvestmentType> getTradableTypes() {
        return Arrays.stream(values())
                .filter(type -> type.tradable)
                .collect(Collectors.toList());
    }

    /**
     * Gets all investment types that can pay dividends.
     *
     * @return List of dividend-paying investment types
     */
    public static List<InvestmentType> getDividendPayingTypes() {
        return Arrays.stream(values())
                .filter(type -> type.isCanPayDividends())
                .collect(Collectors.toList());
    }

    /**
     * Returns the display name of the investment type.
     *
     * @return The display name
     */
    @Override
    public String toString() {
        return displayName;
    }
}